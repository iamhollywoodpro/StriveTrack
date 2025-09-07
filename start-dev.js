#!/usr/bin/env node

const { spawn } = require('child_process');

// Start wrangler pages dev
const wrangler = spawn('npx', [
    'wrangler', 
    'pages', 
    'dev', 
    'public',
    '--compatibility-date=2023-08-07',
    '--port=3001'
], {
    stdio: 'inherit',
    cwd: '/home/user/webapp'
});

wrangler.on('error', (err) => {
    console.error('Failed to start wrangler:', err);
    process.exit(1);
});

wrangler.on('close', (code) => {
    console.log(`Wrangler process exited with code ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down development server...');
    wrangler.kill();
});

process.on('SIGTERM', () => {
    console.log('Shutting down development server...');
    wrangler.kill();
});