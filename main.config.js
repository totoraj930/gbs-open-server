module.exports = {
  apps: [
    {
      name: 'gbs-open-server',
      script: './dist/index.js',
      instances: 4,
      exec_mode: 'fork',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      increment_var: 'SERVER_PORT',
      env: {
        SERVER_PORT: 10510,
      },
    },
  ],
};
