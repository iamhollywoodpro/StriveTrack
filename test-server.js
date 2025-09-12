// Simple test server for cloud-enabled StriveTrack
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const PUBLIC_DIR = join(__dirname, 'public');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = createServer((req, res) => {
  let filePath = join(PUBLIC_DIR, req.url === '/' ? 'index-cloud.html' : req.url);
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Handle service files from parent directories
  if (req.url.startsWith('/config/') || req.url.startsWith('/services/')) {
    filePath = join(__dirname, req.url.slice(1));
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath);
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      
      res.end(content);
    } catch (error) {
      console.error('Error reading file:', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  } else {
    console.log('File not found:', filePath);
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 StriveTrack test server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
  console.log('🔍 Testing cloud storage functionality...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

export default server;