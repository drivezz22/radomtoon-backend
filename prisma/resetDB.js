require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function run() {
  await prisma.$executeRawUnsafe("DROP Database radomtoon");
  await prisma.$executeRawUnsafe("CREATE Database radomtoon");
}
console.log("Reset DB...");
run();
