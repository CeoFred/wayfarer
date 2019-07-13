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
      ssl: false,
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
      ssl: false,

    },
  },

  production: {
    server: {
      port: process.env.PORT || 8002,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      user: 'kqugrtia',
      host: 'raja.db.elephantsql.com',
      database: 'kqugrtia',
      password: 'wj_XPTuaVJY5TbYOoGj362ZOU8PLht7R',
      port: '5432',
      ssl: true,

    },
  },
  ci: {
    server: {
      port: process.env.PORT || 8002,
      hostname: process.env.HOSTNAME || 'localhost',
    },
    database: {
      user: 'kqugrtia',
      host: 'raja.db.elephantsql.com',
      database: 'kqugrtia',
      password: 'wj_XPTuaVJY5TbYOoGj362ZOU8PLht7R',
      port: '5432',
      ssl: true,
    },
  },
};

config[env].isDev = env === 'development';
config[env].isTest = env === 'test';
config[env].isProd = env === 'production';

module.exports = config[env];
