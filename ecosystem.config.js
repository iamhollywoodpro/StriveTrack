module.exports = {
  apps: [{
    name: 'strivetrack-dev',
    script: 'wrangler',
    args: 'pages dev public --compatibility-date=2024-09-07 --port 8787',
    cwd: '/home/user/webapp',
    instances: 1,
    exec_mode: 'fork',
    interpreter: 'npx',
    env: {
      NODE_ENV: 'development'
    },
    log_file: './server.log',
    out_file: './server.log',
    error_file: './server.log',
    merge_logs: true,
    time: true,
    autorestart: true,
    max_restarts: 3,
    min_uptime: '5s'
  }]
};
