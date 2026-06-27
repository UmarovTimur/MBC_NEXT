module.exports = {
  apps: [
    {
      name: 'admin',
      cwd: '/home/ubuntu/srv/MBC_NEXT',
      script: 'yarn',
      args: 'workspace @mbc/admin exec next start --hostname 0.0.0.0 --port 8001',
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/home/ubuntu/srv/MBC_NEXT/logs/admin-out.log',
      error_file: '/home/ubuntu/srv/MBC_NEXT/logs/admin-error.log',
    },
    {
      name: 'az',
      cwd: '/home/ubuntu/srv/MBC_NEXT',
      script: 'yarn',
      args: 'workspace @mbc/az exec next start --hostname 0.0.0.0 --port 3001',
      autorestart: true,
      watch: false,
      time: true,
      out_file: '/home/ubuntu/srv/MBC_NEXT/logs/az-out.log',
      error_file: '/home/ubuntu/srv/MBC_NEXT/logs/az-error.log',
    },
  ],
};
