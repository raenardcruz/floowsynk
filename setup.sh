#!/bin/bash

# Detect OS
OS="$(uname -s)"

# Read JSON flags if setup.json exists
SETUP_JSON="setup.json"
SKIP_DOCKER=false
SKIP_PROTOBUF=false
SKIP_NPM=false
SKIP_GO=false

if [[ -f "$SETUP_JSON" ]] && command -v jq >/dev/null 2>&1; then
  SKIP_DOCKER=$(jq -r '.skip_docker' "$SETUP_JSON")
  SKIP_PROTOBUF=$(jq -r '.skip_protobuf' "$SETUP_JSON")
  SKIP_NPM=$(jq -r '.skip_npm' "$SETUP_JSON")
  SKIP_GO=$(jq -r '.skip_go' "$SETUP_JSON")
fi

# Update package lists
if [[ "$OS" == "Linux" ]]; then
  sudo apt-get update
elif [[ "$OS" == "Darwin" ]]; then
  if ! command -v brew >/dev/null 2>&1; then
    echo "❌ Homebrew not found. Please install it first: https://brew.sh/"
    exit 1
  fi
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
if [[ "$SKIP_DOCKER" != "true" ]]; then
  if [[ "$OS" == "Linux" ]]; then
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
  elif [[ "$OS" == "Darwin" ]]; then
    brew install --cask docker
    open /Applications/Docker.app
  fi
else
  echo "⏩ Skipping Docker installation as requested."
fi

# Install Golang
if [[ "$SKIP_GO" != "true" ]]; then
  GO_VERSION="1.20.5"
  if [[ "$OS" == "Linux" ]]; then
    wget https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz
    sudo tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
    rm go${GO_VERSION}.linux-amd64.tar.gz
  elif [[ "$OS" == "Darwin" ]]; then
    brew install go
  fi
else
  echo "⏩ Skipping Go installation as requested."
fi

# Add Go to PATH
# Common Go binary path on macOS/Linux
GO_BIN_PATH="/usr/local/go/bin"
GOPATH_BIN="$(go env GOPATH)/bin"

update_shell_config() {
  local config_file=$1
  if [[ -f "$config_file" ]]; then
    if ! grep -q "$GO_BIN_PATH" "$config_file"; then
      echo "export PATH=\$PATH:$GO_BIN_PATH" >> "$config_file"
      echo "Added $GO_BIN_PATH to $config_file"
    fi
    if ! grep -q "$GOPATH_BIN" "$config_file"; then
      echo "export PATH=\$PATH:$GOPATH_BIN" >> "$config_file"
      echo "Added $GOPATH_BIN to $config_file"
    fi
  fi
}

update_shell_config "$HOME/.bashrc"
update_shell_config "$HOME/.zshrc"
update_shell_config "$HOME/.bash_profile"
update_shell_config "$HOME/.zprofile"

# Install Node.js and npm
if [[ "$SKIP_NPM" != "true" ]]; then
  if [[ "$OS" == "Linux" ]]; then
    sudo apt-get install -y nodejs npm
  elif [[ "$OS" == "Darwin" ]]; then
    brew install node
  fi
else
  echo "⏩ Skipping Node.js/npm installation as requested."
fi

# Install protobuf compiler
if [[ "$SKIP_PROTOBUF" != "true" ]]; then
  if [[ "$OS" == "Linux" ]]; then
    sudo apt-get install -y protobuf-compiler
  elif [[ "$OS" == "Darwin" ]]; then
    brew install protobuf
  fi
  # Install protoc-gen-go and protoc-gen-go-grpc
  go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
else
  echo "⏩ Skipping Protobuf installation as requested."
fi

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