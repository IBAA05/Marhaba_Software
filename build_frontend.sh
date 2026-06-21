#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18
cd /home/ibaa/Softwares/Marhaba_Software/Frontend
npm run build > build_output.log 2>&1
echo "Build finished with exit code $?"
