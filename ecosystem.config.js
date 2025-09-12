module.exports = {
  apps: [{
    name: 'strivetrack-test',
    script: 'python3',
    args: '-m http.server 8080',
    cwd: './public',
    env: {
      NODE_ENV: 'development'
    },
    log_file: './test-server.log',
    out_file: './test-server-out.log',
    error_file: './test-server-error.log',
    merge_logs: true,
    autorestart: true,
    watch: false
  }]
};