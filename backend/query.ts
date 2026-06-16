import prisma from './src/config/db';

async function main() {
  const members = await prisma.member.findMany({
    include: { memberships: true },
  });
  console.log(JSON.stringify(members, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
