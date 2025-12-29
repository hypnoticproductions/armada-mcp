# ARMADA MCP Tool Deployment

## Deployment to Railway

### Option 1: Deploy with GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   cd /workspace/armada-premium
   git init
   git add mcp-tool/
   git commit -m "Add ARMADA MCP Tool"
   git remote add origin https://github.com/YOUR_USERNAME/armada-mcp.git
   git push -u origin main
   ```

2. **Connect to Railway**
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `armada-mcp` repository
   - Select the `mcp-tool` directory as root

3. **Configure Environment**
   - In Railway dashboard, go to your service
   - Click "Variables" tab
   - Add: `PORT=3001` (optional, defaults to 3001)
   - Add: `NODE_ENV=production`

4. **Deploy**
   - Railway will automatically detect the `railway.json` and `Dockerfile`
   - Click "Deploy" to start

### Option 2: Deploy with Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd mcp-tool
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Set Environment Variables**
   ```bash
   railway vars set PORT=3001
   railway vars set NODE_ENV=production
   ```

### Option 3: Deploy with Docker

1. **Build Docker Image**
   ```bash
   cd mcp-tool
   docker build -t armada-mcp .
   ```

2. **Run Container**
   ```bash
   docker run -d -p 3001:3001 --name armada-mcp armada-mcp
   ```

## Testing the Deployment

### Health Check
```bash
curl https://YOUR-RAILWAY-SUBDOMAIN.up.railway.app/health
```

Expected response:
```json
{"status":"healthy","uptime":123.45}
```

### WebSocket Connection
```javascript
const WebSocket = require('ws');
const ws = new WebSocket('wss://YOUR-RAILWAY-SUBDOMAIN.up.railway.app');

ws.on('open', () => {
  console.log('Connected to ARMADA MCP');
  
  ws.send(JSON.stringify({
    action: 'validate',
    params: {
      content: 'Test content',
      corridor: 'jamaica'
    }
  }));
});

ws.on('message', (data) => {
  console.log(JSON.parse(data.toString()));
});
```

## Next.js Integration

Update your Next.js environment to connect to the MCP server:

1. **Set Environment Variable**
   ```
   MCP_WS_URL=wss://YOUR-RAILWAY-SUBDOMAIN.up.railway.app
   ```

2. **Update API Routes**
   Modify `/workspace/armada-premium/app/api/validate/route.ts` to use WebSocket client instead of direct validation.

## Scaling

- **Replica Count**: Increase in `railway.json` for high availability
- **Memory**: Adjust in Railway dashboard if needed
- **Health Check**: Configured at `/health` endpoint

## Monitoring

- View logs in Railway dashboard
- Check health endpoint for status
- Monitor WebSocket connections

## Troubleshooting

### Connection Refused
- Check that the server is running
- Verify the WebSocket URL is correct
- Ensure Railway has finished deploying

### High Latency
- Consider adding more replicas
- Check Railway metrics for resource usage

### Memory Issues
- Increase container memory in Railway settings
- Optimize validation algorithms if needed
