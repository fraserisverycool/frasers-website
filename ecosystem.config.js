module.exports = {
  apps: [
    {
      name: 'FrasersDatabase',
      script: 'database.js',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
