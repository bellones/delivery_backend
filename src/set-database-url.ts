/**
 * Deve rodar antes do Prisma carregar (ex.: node -r dist/src/set-database-url.js dist/src/main.js).
 * Preenche DATABASE_URL a partir de variáveis que o Railway/Postgres costumam injetar.
 */
if (!process.env.DATABASE_URL) {
  const url =
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRIVATE_URL ??
    process.env.DATABASE_PRIVATE_URL;
  if (url) {
    process.env.DATABASE_URL = url;
  }
}
