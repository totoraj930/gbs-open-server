module.exports = {
  apps: [
    {
      name: 'gbs-open-server',
      script: './dist/index.js',
      instances: 3,
      exec_mode: 'fork',
      increment_var: 'SERVER_PORT',
      env: {
        SERVER_PORT: 10510,
      },
    },
  ],
};
