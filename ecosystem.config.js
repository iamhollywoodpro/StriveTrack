module.exports = {
  apps: [{
    name: 'strivetrack-dev',
    script: './start-dev.js',
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