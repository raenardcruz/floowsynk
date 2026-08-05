# MongoDB Integration Guide for n8n
## 1. Overview
Provider: MongoDB Inc. / MongoDB Atlas
API / Connection Type: MongoDB Wire Protocol (Native Driver / SRV URI)
Primary Auth Method: Username + Password / MongoDB Atlas SRV Connection String
Official Docs: [MongoDB Manual & Docs](https://www.mongodb.com/docs/)
## 2. Required Connection Parameters
Connection String (SRV URI): mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>
Host / Port (for standard non-SRV servers): Hostname (default port 27017).
Database Name: Target database name.
Collection Name: Target collection for document operations.
## 3. Step-by-Step Instructions to Obtain Data
Retrieve Connection String from MongoDB Atlas:
Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
Navigate to Database under Deployment.
Click Connect next to your cluster.
Choose Drivers (Connect your application).
Copy the connection string format: mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority.
Configure Database User & IP Access:
In left menu, go to Database Access > Add New Database User.
Set Username and Password, and grant readWriteAnyDatabase or specific database access roles.
Go to Network Access > Add IP Address. Add your n8n server IP address (or 0.0.0.0/0 with strong authentication).
## 4. Supported Operations in n8n
Find / Query: Search documents using MongoDB Query Filters ({"status": "active"}).
Insert: Insert single or multiple JSON documents into a collection.
Update: Update existing documents using MongoDB update operators ({$set: {"status": "processed"}}).
Delete: Remove matching documents from a collection.
Aggregate: Execute multi-stage aggregation pipelines.
## 5. Connection String Format
mongodb+srv://n8n_user:secret_password@cluster0.abcde.mongodb.net/my_app_db?retryWrites=true&w=majority
## 6. n8n Implementation Notes
Credential Setup: In n8n, select MongoDB and enter the Connection String (or Host, Port, User, Password, Database).
ObjectId Conversion: When querying by ID, n8n automatically handles _id string-to-ObjectId conversion.
