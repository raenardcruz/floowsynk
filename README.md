# FloowSynk Local Development Setup

## Prerequisites

### Windows Subsystem for Linux (WSL)
1. Enable WSL by running PowerShell as Administrator:
   ```powershell
   wsl --install
   ```
   > Note: Restart your computer after installation if prompted

2. Install and set up Ubuntu:
   ```powershell
   wsl -d ubuntu
   ```
   > Tip: If this fails, try running `wsl --install -d Ubuntu` first

### Shell Setup
1. Install Oh My Zsh:
   ```bash
   # Install required packages
   sudo apt install zsh curl git -y
   
   # Install Oh My Zsh
   sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
   ```

2. Configure shell aliases:
   ```bash
   # Open .zshrc in text editor
   nano ~/.zshrc

   # Add these lines to the file
   alias floowsynk="cd /mnt/c/Users/raena/OneDrive/Desktop/floowsynk"
   alias fcode="code /mnt/c/Users/raena/OneDrive/Desktop/floowsynk"
   
   # Save changes (Ctrl+O, then Enter) and exit (Ctrl+X)
   source ~/.zshrc  # Reload configuration
   ```

3. Make zsh the default terminal:
    ```bash
    # Set default
    chsh -s /usr/bin/zsh

    # Validate
    echo $SHELL
    # should output /usr/bin/zsh
    ```

### Development Tools
1. Install essential packages:
   ```bash
   # Update package list
   sudo apt update && sudo apt upgrade -y
   
   # Install required tools
   sudo apt install make golang-go code git -y
   ```

2. Install Node.js using NVM:
   ```bash
   # Install NVM
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Reload shell configuration
   source ~/.zshrc
   
   # Install Node.js
   nvm install 22
   nvm use 22
   ```

### Docker Configuration
1. Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. Configure Docker Desktop:
   - Open Docker Desktop
   - Navigate to Settings (⚙️)
   - Enable required settings:
     - General > ✓ Use WSL 2 based engine
     - General > ✓ Add *.docker.internal to hosts file
     - Resources > WSL Integration > ✓ Ubuntu
   - Click 'Apply & Restart'

3. Verify Docker installation:
   ```bash
   docker --version
   docker-compose --version
   ```

## Project Setup

1. Navigate to project:
   ```bash
   floowsynk
   ```

2. Install dependencies:
   ```bash
   make install
   ```

3. Setup database:
   ```bash
   sudo make db-install
   ```
   > Note: sudo is required for Docker filesystem access

4. Start development server:
   ```bash
   make start
   ```

## Troubleshooting

- If WSL commands fail: Ensure Windows features "Virtual Machine Platform" and "Windows Subsystem for Linux" are enabled
- Docker access denied: Run `sudo usermod -aG docker $USER` and restart your terminal
- VS Code not found: Install using `sudo apt install code` or download from [VS Code website](https://code.visualstudio.com/)

## Development Tips

- Use `code .` to open current directory in VS Code
- Run `docker ps` to check running containers
- Use `make help` to see available commands
