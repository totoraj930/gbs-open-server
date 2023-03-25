module.exports = {
  apps: [
    {
      name: 'gbs-open-monitor',
      script: './dist/monitor/index.js',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {},
    },
  ],
};
