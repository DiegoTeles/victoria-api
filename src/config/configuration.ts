export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  databaseSsl: process.env.DATABASE_SSL === 'true',
  useSecureCookie: process.env.USE_SECURE_COOKIE === 'true',
  uploadDir: process.env.UPLOAD_DIR ?? 'data/uploads',
  publicOrigin: (process.env.PUBLIC_ORIGIN ?? '').replace(/\/$/, ''),
  spaIndexPath: (process.env.SPA_INDEX_PATH ?? '').trim(),
});
