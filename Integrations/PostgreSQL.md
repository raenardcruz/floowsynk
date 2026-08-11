# PostgreSQL API / Database Integration Guide for n8n
## 1. Overview
Provider: PostgreSQL
API / Connection Type: Direct TCP Database Connection (Postgres Wire Protocol)
Primary Auth Method: Username + Password / SSL Certificates
Official Docs: [PostgreSQL Documentation](https://www.postgresql.org/docs/)
## 2. Required Connection Parameters
Host: Hostname or IP address (e.g., db.example.com or 10.0.0.1).
Port: Database port (default: 5432).
Database: Target database name.
User: Database username.
Password: Secret password for the user.
SSL: SSL Mode (disable, require, prefer) and optional CA Certificate.
## 3. Step-by-Step Instructions to Obtain Data
Retrieve Database Connection Details:
Log in to your cloud database dashboard (AWS RDS, Supabase, Neon, DigitalOcean, Render, etc.).
Navigate to Connection Info or Database Credentials.
Create Dedicated n8n DB User (Recommended for security):
Connect to your database using psql or pgAdmin.
Run SQL commands:

CREATE USER n8n_app WITH PASSWORD 'your_strong_password';

GRANT CONNECT ON DATABASE target_db TO n8n_app;

GRANT USAGE ON SCHEMA public TO n8n_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO n8n_app;

Configure Network Security:
Ensure PostgreSQL port 5432 is open to your n8n host IP address in cloud security groups or firewall rules.
## 4. Supported Operations in n8n
Execute SQL Query: Run custom SELECT, INSERT, UPDATE, DELETE, or stored procedure calls.
Insert Rows: Bulk insert JSON items directly into a target table.
Update Rows: Match records by primary/unique keys and update fields.
## 5. Header / Connection String Format
postgres://n8n_app:your_strong_password@db.example.com:5432/target_db?sslmode=require
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Postgres and enter Host, Port, Database, User, Password, and SSL Mode.
Parameterized Queries: Always use query parameter binding ($1, $2) to prevent SQL injection vulnerabilities.
