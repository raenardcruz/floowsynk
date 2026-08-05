# AWS S3 API Integration Guide for n8n
## 1. Overview
Provider: Amazon Web Services (AWS)
API Type: REST API (AWS SigV4 Authentication)
Primary Auth Method: IAM Access Key ID + Secret Access Key
Official Docs: [AWS S3 REST API Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html)
## 2. Required Authentication Parameters
Access Key ID: Key identifier string starting with AKIA or ASIA.
Secret Access Key: AWS secret access key string.
Region: AWS datacenter region code (e.g., us-east-1, ap-southeast-1).
Bucket Name: Name of your target S3 bucket.
## 3. Step-by-Step Instructions to Obtain Data
Create IAM User & Attach S3 Policy:
Log in to [AWS Console](https://console.aws.amazon.com/).
Open IAM service > navigate to Users > click Add users.
Enter User Name (e.g., n8n-s3-user).
Under Permissions options, attach policy directly: select AmazonS3FullAccess (or attach a custom scoped IAM policy for your specific bucket).
Generate Access Key:
Click the created user name > switch to the Security credentials tab.
Scroll down to Access keys and click Create access key.
Choose Third-party service (or Application running outside AWS).
Click Next > Create access key.
Copy and download both the Access Key ID (AKIA...) and Secret Access Key.
Retrieve Bucket Name & Region:
Open S3 service in AWS Console.
Note your exact Bucket Name and AWS Region code (e.g., us-east-1).
## 4. Base Endpoints & Key Resources
Base Endpoint: https://{bucket_name}.s3.{region}.amazonaws.com
Upload File: PUT /{object_key}
Download File: GET /{object_key}
Delete File: DELETE /{object_key}
List Bucket Objects: GET /?list-type=2
## 5. Header / Request Format
Authorization: AWS4-HMAC-SHA256 Credential=AKIA.../20260803/us-east-1/s3/aws4_request, ...

x-amz-date: 20260803T120000Z
## 6. n8n Implementation Notes
Credential Setup: In n8n, select AWS credential type and enter Access Key ID, Secret Access Key, and Region.
Binary Data Handling: Use n8n binary data properties when uploading or downloading files to/from S3.
