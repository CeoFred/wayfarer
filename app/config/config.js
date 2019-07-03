const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    server: {
      port: process.env.PORT || 8001,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      url: 'mongodb://localhost/express-development',
    },
  },

  test: {
    server: {
      port: process.env.PORT || 8001,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      url: 'mongodb://localhost/express-test',
    },
  },

  production: {
    server: {
      port: process.env.PORT || 3200,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      url: 'mongodb://mongo:27017/express-production',
    },
  },
};

config[env].isDev = env === 'development';
config[env].isTest = env === 'test';
config[env].isProd = env === 'production';

module.exports = config[env];
