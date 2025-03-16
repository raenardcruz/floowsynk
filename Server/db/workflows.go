package db

import (
	"encoding/json"
	"errors"
	"log"

	pb "github.com/raenardcruz/floowsynk/proto"
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

func (db *DB) CreateWorkflow(workflow *pb.Workflow) (string, error) {
	query := `
		INSERT INTO workflows (id, name, type, description, nodes, edges, created_by, updated_by, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
		RETURNING id`

	nodes, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return "", err
	}
	edges, err := json.Marshal(workflow.Edges)
	if err != nil {
		return "", err
	}

	var id string
	err = db.conn.QueryRow(
		query,
		workflow.Id,
		workflow.Name,
		workflow.Type,
		workflow.Description,
		nodes,
		edges,
		workflow.CreatedBy,
		workflow.UpdatedBy,
	).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (db *DB) GetWorkflows(limit, offset int) (wl *pb.WorkflowList, err error) {
	wl = &pb.WorkflowList{
		Workflows: make([]*pb.Workflow, 0),
	}
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

	for rows.Next() {
		workflow := &pb.Workflow{}
		var nodes, edges JSONB
		err = rows.Scan(
			&workflow.Id,
			&workflow.Type,
			&workflow.Name,
			&workflow.Description,
			&nodes,
			&edges,
			&workflow.CreatedAt,
			&workflow.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning workflow: %v", err)
			return nil, err
		}
		if err := json.Unmarshal(nodes, &workflow.Nodes); err != nil {
			log.Printf("Error unmarshalling nodes: %v", err)
			return nil, err
		}
		if err := json.Unmarshal(edges, &workflow.Edges); err != nil {
			log.Printf("Error unmarshalling edges: %v", err)
			return nil, err
		}

		wl.Workflows = append(wl.Workflows, workflow)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return wl, nil
}

func (db *DB) GetWorkflow(id string) (workflow *pb.Workflow, err error) {
	query := `
		SELECT id, name, description, nodes, edges, created_at, updated_at 
		FROM workflows 
		WHERE id = $1`

	workflow = &pb.Workflow{}
	var nodes, edges JSONB
	err = db.conn.QueryRow(query, id).Scan(
		&workflow.Id,
		&workflow.Name,
		&workflow.Description,
		&nodes,
		&edges,
		&workflow.CreatedAt,
		&workflow.UpdatedAt,
	)
	if err != nil {
		log.Printf("Error scanning workflow: %v", err)
		return workflow, err
	}
	if err := json.Unmarshal(nodes, &workflow.Nodes); err != nil {
		log.Printf("Error unmarshalling nodes: %v", err)
		return workflow, err
	}
	if err := json.Unmarshal(edges, &workflow.Edges); err != nil {
		log.Printf("Error unmarshalling edges: %v", err)
		return workflow, err
	}

	return workflow, nil
}

func (db *DB) UpdateWorkflow(workflow *pb.Workflow) (err error) {
	query := `
		UPDATE workflows 
		SET name = $1, description = $2, nodes = $3, edges = $4, updated_by = $5, type = $6, updated_at = NOW()
		WHERE id = $7`

	nodes, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return err
	}
	edges, err := json.Marshal(workflow.Edges)
	if err != nil {
		return err
	}

	_, err = db.conn.Exec(
		query,
		workflow.Name,
		workflow.Description,
		nodes,
		edges,
		workflow.UpdatedBy,
		workflow.Type,
		workflow.Id,
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
