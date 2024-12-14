@echo off

:: Stop and remove existing container
docker stop floowsynk-db-container
docker rm floowsynk-db-container

:: Build Docker image
docker build -t floowsynk-db .

:: Run Docker container
docker run -d --name floowsynk-db-container -p 5432:5432 floowsynk-db

:: Pause for 5 seconds to allow container to start
timeout /t 5

:: Verify container status
docker ps -a

:: Pause to keep window open
pause