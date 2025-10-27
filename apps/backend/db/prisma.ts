import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
});

prisma.$connect().then(() => {
  console.log('Database connected with optimized pool');
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
