import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Fallback para build (ex.: Railway): prisma generate não conecta ao DB, só precisa do schema.
const databaseUrl =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
