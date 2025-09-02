module.exports = {
  apps: [{
    name: 'strivetrack-dev',
    script: './node_modules/.bin/wrangler',
    args: 'pages dev public --compatibility-date=2023-08-07 --port=8787 --binding DB=./.wrangler/state/d1/DB.sqlite3',
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