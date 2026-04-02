function buildConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    return {
      url,
      dialect: 'postgres',
      dialectOptions: {
        ssl:
          process.env.DATABASE_SSL === 'true'
            ? { require: true, rejectUnauthorized: false }
            : false,
      },
    };
  }
  return {
    username: process.env.DB_USER || 'vic',
    password: process.env.DB_PASSWORD || 'vic',
    database: process.env.DB_NAME || 'vic',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
  };
}

module.exports = {
  development: buildConfig(),
  production: buildConfig(),
};
