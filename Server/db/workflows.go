package db

import "encoding/json"

func (db *DB) CreateWorkflow(workflow WorkflowModel) (string, error) {
	query := `
		INSERT INTO workflows (id, name, description, nodes, edges, created_by, updated_by, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
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
		SELECT id, name, description, nodes, edges, created_at, updated_at 
		FROM workflows
		ORDER BY id
		LIMIT $1 OFFSET $2`

	rows, err := db.conn.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workflows []WorkflowModel
	for rows.Next() {
		var workflow WorkflowModel
		err := rows.Scan(
			&workflow.ID,
			&workflow.Name,
			&workflow.Description,
			&workflow.Nodes,
			&workflow.Edges,
			&workflow.CreatedAt,
			&workflow.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
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
	err := db.conn.QueryRow(query, id).Scan(
		&workflow.ID,
		&workflow.Name,
		&workflow.Description,
		&workflow.Nodes,
		&workflow.Edges,
		&workflow.CreatedAt,
		&workflow.UpdatedAt,
	)
	if err != nil {
		return WorkflowModel{}, err
	}
	return workflow, nil
}

func (db *DB) UpdateWorkflow(workflow WorkflowModel) error {
	query := `
		UPDATE workflows 
		SET name = $1, description = $2, nodes = $3, edges = $4, updated_at = NOW() 
		WHERE id = $5`

	_, err := db.conn.Exec(
		query,
		workflow.Name,
		workflow.Description,
		workflow.Nodes,
		workflow.Edges,
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
