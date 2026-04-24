module.exports = {
  apps: [
    {
      name: 'apex-server',
      cwd: './server',
      script: 'index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'apex-client',
      cwd: './client',
      script: 'node_modules/.bin/vite',
      args: '--host',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
