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
      database: 'wayfarer',
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
      user: '',
      host: '',
      database: 'wayfarer',
      password: '',
      port: '5432',
    },
  },
};

config[env].isDev = env === 'development';
config[env].isTest = env === 'test';
config[env].isProd = env === 'production';

module.exports = config[env];
