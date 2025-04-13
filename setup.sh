#!/bin/bash

# Detect OS
OS="$(uname -s)"

# Update package lists
if [[ "$OS" == "Linux" ]]; then
  sudo apt-get update
elif [[ "$OS" == "Darwin" ]]; then
  brew update
else
  echo "Unsupported OS: $OS"
  exit 1
fi

# Install Make
if [[ "$OS" == "Linux" ]]; then
  sudo apt-get install -y make
elif [[ "$OS" == "Darwin" ]]; then
  brew install make
fi

# Install Docker
if [[ "$OS" == "Linux" ]]; then
  sudo apt-get install -y docker.io
  sudo systemctl start docker
  sudo systemctl enable docker
elif [[ "$OS" == "Darwin" ]]; then
  brew install --cask docker
  open /Applications/Docker.app
fi

# Install Golang
GO_VERSION="1.20.5"
if [[ "$OS" == "Linux" ]]; then
  wget https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz
  sudo tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
  rm go${GO_VERSION}.linux-amd64.tar.gz
elif [[ "$OS" == "Darwin" ]]; then
  brew install go
fi

# Add Go to PATH
if ! grep -q "export PATH=\$PATH:/usr/local/go/bin" ~/.bashrc; then
  echo "export PATH=\$PATH:/usr/local/go/bin" >> ~/.bashrc
  source ~/.bashrc
fi

# Install Node.js and npm
if [[ "$OS" == "Linux" ]]; then
  sudo apt-get install -y nodejs npm
elif [[ "$OS" == "Darwin" ]]; then
  brew install node
fi

# Install protobuf compiler
if [[ "$OS" == "Linux" ]]; then
  sudo apt-get install -y protobuf-compiler
elif [[ "$OS" == "Darwin" ]]; then
  brew install protobuf
fi

# Install protoc-gen-go and protoc-gen-go-grpc
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Verify installations
echo "\nVerifying installations..."
make --version
docker --version
go version
node --version
npm --version
protoc --version

# Print completion message
echo "\nAll dependencies have been installed successfully!"