import prisma from '../../config/db';

export const getCurrentSubscription = async (organizationId: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: { organizationId },
    orderBy: { endDate: 'desc' },
    include: { plan: true },
  });

  if (!subscription) {
    throw new Error('No active subscription found for this organization');
  }

  // Check if it's expired in real time
  const isExpired = new Date(subscription.endDate) < new Date();
  
  return {
    ...subscription,
    status: isExpired ? 'EXPIRED' : subscription.status,
  };
};

export const checkStudentLimit = async (organizationId: string) => {
  const subscription = await getCurrentSubscription(organizationId);

  if (subscription.status === 'EXPIRED') {
    throw new Error('Your subscription has expired. Please upgrade your plan to add more members.');
  }

  const currentStudentCount = await prisma.member.count({
    where: { organizationId },
  });

  if (currentStudentCount >= subscription.plan.maxStudents) {
    throw new Error(`You have reached the maximum limit of ${subscription.plan.maxStudents} members on the ${subscription.plan.name} plan. Please upgrade to add more members.`);
  }

  return true;
};

export const ensureDefaultPlans = async () => {
  // Check if plans exist, if not create default ones
  const count = await prisma.plan.count();
  if (count === 0) {
    await prisma.plan.createMany({
      data: [
        {
          name: 'Free Trial',
          maxStudents: 50,
          price: 0,
          durationDays: 14,
        },
        {
          name: 'Pro',
          maxStudents: 500,
          price: 999,
          durationDays: 30,
        },
        {
          name: 'Enterprise',
          maxStudents: 5000,
          price: 2999,
          durationDays: 30,
        },
      ],
    });
  }
};
