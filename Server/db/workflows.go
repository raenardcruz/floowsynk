package db

import (
	"encoding/json"
	"errors"
	"log"
)

// Add these types at the top of the file
type JSONB []byte

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	s, ok := value.([]byte)
	if !ok {
		return errors.New("invalid scan source for JSONB")
	}
	*j = append((*j)[0:0], s...)
	return nil
}

func (db *DB) CreateWorkflow(workflow WorkflowModel) (string, error) {
	query := `
		INSERT INTO workflows (id, name, type, description, nodes, edges, created_by, updated_by, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
		RETURNING id`

	nodesJSON, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return "", err
	}

	edgesJSON, err := json.Marshal(workflow.Edges)
	if err != nil {
		return "", err
	}

	var id string
	err = db.conn.QueryRow(
		query,
		workflow.ID,
		workflow.Name,
		workflow.Type,
		workflow.Description,
		nodesJSON,
		edgesJSON,
		workflow.CreatedBy,
		workflow.UpdatedBy,
	).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (db *DB) GetWorkflows(limit, offset int) ([]WorkflowModel, error) {
	if limit < 1 {
		limit = 10 // default limit
	}
	if offset < 0 {
		offset = 0
	}

	query := `
		SELECT id, type, name, description, nodes, edges, created_at, updated_at 
		FROM workflows
		ORDER BY id
		LIMIT $1 OFFSET $2`

	rows, err := db.conn.Query(query, limit, offset)
	if err != nil {
		log.Printf("Error querying workflows: %v", err)
		return nil, err
	}
	defer rows.Close()

	var workflows []WorkflowModel
	for rows.Next() {
		var workflow WorkflowModel
		var nodesJSON, edgesJSON JSONB
		err := rows.Scan(
			&workflow.ID,
			&workflow.Type,
			&workflow.Name,
			&workflow.Description,
			&nodesJSON,
			&edgesJSON,
			&workflow.CreatedAt,
			&workflow.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning workflow: %v", err)
			return nil, err
		}

		var nodes []interface{}
		var edges []interface{}
		err = json.Unmarshal(nodesJSON, &nodes)
		if err != nil {
			log.Printf("Error unmarshalling nodes: %v", err)
			return nil, err
		}
		err = json.Unmarshal(edgesJSON, &edges)
		if err != nil {
			log.Printf("Error unmarshalling edges: %v", err)
			return nil, err
		}

		workflow.Nodes = nodes
		workflow.Edges = edges
		workflows = append(workflows, workflow)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return workflows, nil
}

func (db *DB) GetWorkflow(id string) (WorkflowModel, error) {
	query := `
		SELECT id, name, description, nodes, edges, created_at, updated_at 
		FROM workflows 
		WHERE id = $1`

	var workflow WorkflowModel
	var nodesJSON, edgesJSON JSONB
	err := db.conn.QueryRow(query, id).Scan(
		&workflow.ID,
		&workflow.Name,
		&workflow.Description,
		&nodesJSON,
		&edgesJSON,
		&workflow.CreatedAt,
		&workflow.UpdatedAt,
	)
	if err != nil {
		log.Printf("Error scanning workflow: %v", err)
		return WorkflowModel{}, err
	}

	var nodes []interface{}
	var edges []interface{}
	err = json.Unmarshal(nodesJSON, &nodes)
	if err != nil {
		log.Printf("Error unmarshalling nodes: %v", err)
		return WorkflowModel{}, err
	}
	err = json.Unmarshal(edgesJSON, &edges)
	if err != nil {
		log.Printf("Error unmarshalling edges: %v", err)
		return WorkflowModel{}, err
	}

	workflow.Nodes = nodes
	workflow.Edges = edges
	return workflow, nil
}

func (db *DB) UpdateWorkflow(workflow WorkflowModel) error {
	query := `
		UPDATE workflows 
		SET name = $1, description = $2, nodes = $3, edges = $4, updated_by = $5, type = $6, updated_at = NOW()
		WHERE id = $7`

	nodesJSON, err := json.Marshal(workflow.Nodes)
	if err != nil {
		log.Printf("Error marshalling nodes: %v", err)
		return err
	}
	edgesJSON, err := json.Marshal(workflow.Edges)
	if err != nil {
		log.Printf("Error marshalling edges: %v", err)
		return err
	}

	_, err = db.conn.Exec(
		query,
		workflow.Name,
		workflow.Description,
		nodesJSON,
		edgesJSON,
		workflow.UpdatedBy,
		workflow.Type,
		workflow.ID,
	)
	return err
}

func (db *DB) DeleteWorkflow(id string) error {
	query := "DELETE FROM workflows WHERE id = $1"
	_, err := db.conn.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
