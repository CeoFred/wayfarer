const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    server: {
      port: process.env.PORT || 8001,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      user: 'postgres',
      host: 'localhost',
      database: 'wayfarer',
      password: 'iftrueconnect',
      port: '5432',
    },
  },

  test: {
    server: {
      port: process.env.PORT || 8011,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      user: 'postgres',
      host: 'localhost',
      database: 'wayfarer_test',
      password: 'iftrueconnect',
      port: '5432',
    },
  },

  production: {
    server: {
      port: process.env.PORT || 8002,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      user: 'iyfuthdxraayah',
      host: 'ec2-174-129-29-101.compute-1.amazonaws.com',
      database: 'df6k9h555q07ar',
      password: '892b54e56f50fa41ea695d10f5f5fd49dd42685f74fe482e6089aaca7ce7d270',
      port: '5432',
    },
  },
  ci: {
    server: {
      port: process.env.PORT || 8002,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      user: 'iyfuthdxraayah',
      host: 'ec2-174-129-29-101.compute-1.amazonaws.com',
      database: 'df6k9h555q07ar',
      password: '892b54e56f50fa41ea695d10f5f5fd49dd42685f74fe482e6089aaca7ce7d270',
      port: '5432',
    },
  },
};

config[env].isDev = env === 'development';
config[env].isTest = env === 'test';
config[env].isProd = env === 'production';

module.exports = config[env];
