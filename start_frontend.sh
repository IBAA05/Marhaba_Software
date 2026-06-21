#!/bin/bash
echo "Setting up Node.js 18..."

# Check if nvm is already installed and load it
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
else
    echo "Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

echo "Installing and using Node.js 18..."
nvm install 18
nvm use 18

echo "Starting Marhaba_Software frontend..."
cd /home/ibaa/Softwares/Marhaba_Software/Frontend

npm install
npm run dev
