@echo off

:: Stop and remove existing container
docker stop flowsync-db-container
docker rm flowsync-db-container

:: Build Docker image
docker build -t flowsync-db .

:: Run Docker container
docker run -d --name flowsync-db-container -p 5432:5432 flowsync-db

:: Pause for 5 seconds to allow container to start
timeout /t 5

:: Verify container status
docker ps -a

:: Pause to keep window open
pause