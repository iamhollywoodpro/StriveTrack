module.exports = {
  apps: [{
    name: 'strivetrack-wrangler',
    script: 'wrangler',
    args: 'pages dev public --port 3001 --local --d1 DB',
    cwd: '/home/user/webapp',
    env: {
      NODE_ENV: 'development'
    },
    log_file: './wrangler-server.log',
    out_file: './wrangler-server-out.log',
    error_file: './wrangler-server-error.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};