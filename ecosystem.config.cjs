module.exports = {
  apps: [
    {
      name: 'admin',
      cwd: '/srv/mbc-next',
      script: 'yarn',
      args: 'workspace @mbc/admin exec next start --hostname 0.0.0.0 --port 8001',
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/srv/mbc-next/logs/admin-out.log',
      error_file: '/srv/mbc-next/logs/admin-error.log',
    },
    {
      name: 'az',
      cwd: '/srv/mbc-next',
      script: 'yarn',
      args: 'workspace @mbc/az exec next dev --hostname 0.0.0.0 --port 3001',
      autorestart: true,
      watch: false,
      time: true,
      out_file: '/srv/mbc-next/logs/az-out.log',
      error_file: '/srv/mbc-next/logs/az-error.log',
    },
  ],
};
