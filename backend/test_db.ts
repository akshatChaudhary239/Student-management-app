import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  console.log("Attempting to connect to DB...")
  const count = await prisma.member.count()
  console.log("DB connection successful! Members count:", count)
}
main().catch(console.error).finally(() => prisma.$disconnect())
