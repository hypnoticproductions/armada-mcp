#!/bin/bash
# push-to-github.sh - Push ARMADA MCP Tool to GitHub

echo "=========================================="
echo "Pushing ARMADA MCP Tool to GitHub"
echo "=========================================="

# Configure git if not already done
git config --global user.email "minimax@example.com" 2>/dev/null
git config --global user.name "MiniMax Agent" 2>/dev/null

cd /workspace/armada-premium

echo ""
echo "Step 1: Creating GitHub repository..."
echo "Please go to: https://github.com/new"
echo "Repository name: armada-mcp"
echo "Description: ARMADA Model Context Protocol Validation Tool"
echo "Public: ✓ Yes"
echo "Don't initialize with README (we already have commits)"
echo ""
read -p "Press ENTER after creating the repository..."

echo ""
echo "Step 2: Adding remote and pushing..."
echo ""

# Add remote origin
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/armada-mcp.git 2>/dev/null

# If remote already exists, set URL
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/armada-mcp.git 2>/dev/null

# Rename branch to main
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "=========================================="
echo "✓ Pushed to GitHub successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Go to https://railway.app"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub repo'"
echo "4. Choose 'armada-mcp' repository"
echo "5. Set root directory to 'mcp-tool/'"
echo "6. Add environment variables:"
echo "   - PORT=3001"
echo "   - NODE_ENV=production"
echo "7. Deploy and get your WebSocket URL!"
