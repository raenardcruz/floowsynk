package rag

import (
	"cmp"
	"encoding/json"
	"fmt"
	"math"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	DB "github.com/raenardcruz/floowsynk/Database"
)

// ChunkText splits raw text into overlapping windows
func ChunkText(text string, chunkSize int, overlap int) []string {
	text = strings.TrimSpace(text)
	if text == "" {
		return nil
	}
	if chunkSize <= 0 {
		chunkSize = 500
	}
	if overlap < 0 || overlap >= chunkSize {
		overlap = 50
	}

	var chunks []string
	runes := []rune(text)
	total := len(runes)

	if total <= chunkSize {
		return []string{text}
	}

	step := chunkSize - overlap
	for i := 0; i < total; i += step {
		end := i + chunkSize
		if end > total {
			end = total
		}
		chunk := string(runes[i:end])
		chunk = strings.TrimSpace(chunk)
		if len(chunk) > 0 {
			chunks = append(chunks, chunk)
		}
		if end == total {
			break
		}
	}

	return chunks
}

// CosineSimilarity calculates similarity score between two float32 vectors
func CosineSimilarity(a, b []float32) float32 {
	if len(a) != len(b) || len(a) == 0 {
		return 0
	}
	var dotProduct float64
	var normA float64
	var normB float64

	for i := 0; i < len(a); i++ {
		valA := float64(a[i])
		valB := float64(b[i])
		dotProduct += valA * valB
		normA += valA * valA
		normB += valB * valB
	}

	if normA == 0 || normB == 0 {
		return 0
	}

	return float32(dotProduct / (math.Sqrt(normA) * math.Sqrt(normB)))
}

// ExtractText converts raw file bytes into string content
func ExtractText(fileName string, content []byte) (string, error) {
	if len(content) == 0 {
		return "", fmt.Errorf("file content is empty")
	}

	// Plain text / Markdown / CSV / JSON
	return string(content), nil
}

// ProcessAndIndexDocument parses a document, chunks it, generates embeddings via Ollama, and persists chunks
func ProcessAndIndexDocument(db *DB.DatabaseConnection, env string, ragConn DB.RagConnection, doc DB.RagDocument, content []byte) error {
	rawText, err := ExtractText(doc.FileName, content)
	if err != nil {
		doc.Status = "FAILED"
		doc.ErrorMessage = err.Error()
		_ = db.UpdateRagDocumentEnv(&doc, env)
		return err
	}

	chunksText := ChunkText(rawText, 500, 50)
	if len(chunksText) == 0 {
		doc.Status = "FAILED"
		doc.ErrorMessage = "No text content found in document"
		_ = db.UpdateRagDocumentEnv(&doc, env)
		return fmt.Errorf("no text chunks generated")
	}

	doc.TotalChunkCount = len(chunksText)
	doc.ProcessedChunkCount = 0
	_ = db.UpdateRagDocumentEnv(&doc, env)

	ollamaClient := NewOllamaClient(ragConn.OllamaBaseURL)
	dbChunks := make([]DB.RagChunk, 0, len(chunksText))

	for idx, chunkText := range chunksText {
		vec, err := ollamaClient.GetEmbedding(ragConn.EmbeddingModel, chunkText)
		if err != nil {
			doc.Status = "FAILED"
			doc.ErrorMessage = fmt.Sprintf("Failed generating embedding for chunk %d: %v", idx+1, err)
			_ = db.UpdateRagDocumentEnv(&doc, env)
			return err
		}

		vecJSON, err := json.Marshal(vec)
		if err != nil {
			doc.Status = "FAILED"
			doc.ErrorMessage = fmt.Sprintf("Failed serializing embedding vector: %v", err)
			_ = db.UpdateRagDocumentEnv(&doc, env)
			return err
		}

		chunkID := uuid.New().String()
		parsedVectorCacheMu.Lock()
		if len(parsedVectorCache) < maxParsedVectorCacheEntries {
			parsedVectorCache[chunkID] = vec
		}
		parsedVectorCacheMu.Unlock()

		dbChunks = append(dbChunks, DB.RagChunk{
			ID:              chunkID,
			RagConnectionID: ragConn.ID,
			RagDocumentID:   doc.ID,
			ChunkIndex:      idx,
			Content:         chunkText,
			Embedding:       string(vecJSON),
		})

		doc.ProcessedChunkCount = idx + 1
		_ = db.UpdateRagDocumentEnv(&doc, env)
	}

	if err := db.AddRagChunksEnv(dbChunks, env); err != nil {
		doc.Status = "FAILED"
		doc.ErrorMessage = fmt.Sprintf("Failed saving vector chunks to DB: %v", err)
		_ = db.UpdateRagDocumentEnv(&doc, env)
		return err
	}

	doc.ChunkCount = len(dbChunks)
	doc.Status = "READY"
	doc.ErrorMessage = ""
	return db.UpdateRagDocumentEnv(&doc, env)
}

type ScoredChunk struct {
	Chunk        DB.RagChunk
	DocumentName string
	Score        float32
}

const maxParsedVectorCacheEntries = 10000

var (
	parsedVectorCacheMu sync.RWMutex
	parsedVectorCache   = make(map[string][]float32)
)

// InvalidateParsedVectorCache clears specific chunk IDs or the entire cache if no IDs are passed
func InvalidateParsedVectorCache(chunkIDs ...string) {
	parsedVectorCacheMu.Lock()
	defer parsedVectorCacheMu.Unlock()
	if len(chunkIDs) == 0 {
		parsedVectorCache = make(map[string][]float32)
		return
	}
	for _, id := range chunkIDs {
		delete(parsedVectorCache, id)
	}
}

// getCachedOrParseVector retrieves a parsed []float32 vector from memory or deserializes and caches it
func getCachedOrParseVector(chunkID string, embeddingJSON string) ([]float32, error) {
	if chunkID != "" {
		parsedVectorCacheMu.RLock()
		if cached, ok := parsedVectorCache[chunkID]; ok {
			parsedVectorCacheMu.RUnlock()
			return cached, nil
		}
		parsedVectorCacheMu.RUnlock()
	}

	var vec []float32
	if err := json.Unmarshal([]byte(embeddingJSON), &vec); err != nil {
		return nil, err
	}

	if chunkID != "" {
		parsedVectorCacheMu.Lock()
		if len(parsedVectorCache) >= maxParsedVectorCacheEntries {
			parsedVectorCache = make(map[string][]float32)
		}
		parsedVectorCache[chunkID] = vec
		parsedVectorCacheMu.Unlock()
	}

	return vec, nil
}

// SearchSimilarChunks retrieves topK most relevant text chunks for a query
func SearchSimilarChunks(db *DB.DatabaseConnection, env string, ragConn DB.RagConnection, query string, topK int) ([]ScoredChunk, error) {
	if topK <= 0 {
		topK = 3
	}

	ollamaClient := NewOllamaClient(ragConn.OllamaBaseURL)
	queryVec, err := ollamaClient.GetEmbedding(ragConn.EmbeddingModel, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get query embedding: %w", err)
	}

	allChunks, err := db.ListRagChunksEnv(ragConn.ID, env)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch chunks from database: %w", err)
	}

	if len(allChunks) == 0 {
		return nil, nil
	}

	docMap, _ := db.GetRagDocumentNameMapEnv(ragConn.ID, env)

	var scored []ScoredChunk
	for _, chunk := range allChunks {
		vec, err := getCachedOrParseVector(chunk.ID, chunk.Embedding)
		if err != nil {
			continue
		}

		score := CosineSimilarity(queryVec, vec)
		docName := docMap[chunk.RagDocumentID]
		if docName == "" {
			docName = "Document"
		}

		scored = append(scored, ScoredChunk{
			Chunk:        chunk,
			DocumentName: docName,
			Score:        score,
		})
	}

	// Sort descending by score
	slices.SortFunc(scored, func(a, b ScoredChunk) int {
		return cmp.Compare(b.Score, a.Score)
	})

	if len(scored) > topK {
		scored = scored[:topK]
	}

	return scored, nil
}

// PerformRAGQuery handles similarity retrieval + LLM chat response generation
func PerformRAGQuery(db *DB.DatabaseConnection, env string, ragConn DB.RagConnection, query string, topK int, customSystemPrompt string) (string, []ScoredChunk, error) {
	scoredChunks, err := SearchSimilarChunks(db, env, ragConn, query, topK)
	if err != nil {
		return "", nil, err
	}

	var contextBuilder strings.Builder
	contextBuilder.WriteString("Context information from uploaded documents is below:\n")
	contextBuilder.WriteString("---------------------\n")
	if len(scoredChunks) == 0 {
		contextBuilder.WriteString("(No document context available)\n")
	} else {
		for i, sc := range scoredChunks {
			contextBuilder.WriteString(fmt.Sprintf("[%d] Source: %s\n%s\n\n", i+1, sc.DocumentName, sc.Chunk.Content))
		}
	}
	contextBuilder.WriteString("---------------------\n")

	systemPrompt := customSystemPrompt
	if systemPrompt == "" {
		systemPrompt = "You are a helpful AI assistant. Use the provided context to accurately answer the user's question. If the answer cannot be determined from context, state that clearly."
	}

	userPrompt := fmt.Sprintf("%s\n\nQuestion: %s", contextBuilder.String(), query)

	ollamaClient := NewOllamaClient(ragConn.OllamaBaseURL)
	answer, err := ollamaClient.GenerateChat(ragConn.ChatModel, systemPrompt, userPrompt)
	if err != nil {
		return "", scoredChunks, fmt.Errorf("LLM completion failed: %w", err)
	}

	_ = time.Now()
	return answer, scoredChunks, nil
}
