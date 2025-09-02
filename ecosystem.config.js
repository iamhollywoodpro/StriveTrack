module.exports = {
  apps: [{
    name: 'strivetrack-dev',
    script: 'npx',
    args: 'wrangler pages dev public --compatibility-date=2023-08-07 --port=3000',
    cwd: '/home/user/webapp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    }
  }]
};