import prisma from '../../config/db';

export const getDashboardMetrics = async (organizationId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  // Run independent queries in parallel for performance
  const [
    organization,
    totalStudents,
    activeStudents,
    expiredStudents,
    occupiedSeats,
    feesDueToday,
    feesDueThisWeek,
    recentActivity,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { totalResources: true },
    }),
    prisma.member.count({ where: { organizationId } }),
    prisma.member.count({ where: { organizationId, status: 'ACTIVE' } }),
    prisma.member.count({ where: { organizationId, status: 'EXPIRED' } }),
    prisma.resource.count({ where: { organizationId, memberId: { not: null } } }),
    
    // Members whose membership ends exactly today
    prisma.membership.count({
      where: {
        organizationId,
        endDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // less than tomorrow
        },
      },
    }),

    // Members whose membership ends in the next 7 days
    prisma.membership.count({
      where: {
        organizationId,
        endDate: {
          gte: today,
          lt: endOfWeek,
        },
      },
    }),

    // Top 10 Recent Activities
    prisma.activityLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const totalResources = organization?.totalResources || 0;
  const availableSeats = totalResources - occupiedSeats;

  return {
    members: {
      total: totalStudents,
      active: activeStudents,
      expired: expiredStudents,
      overdue: expiredStudents, // Simplifying overdue as expired for now
    },
    fees: {
      dueToday: feesDueToday,
      dueThisWeek: feesDueThisWeek,
    },
    resources: {
      total: totalResources,
      occupied: occupiedSeats,
      available: availableSeats,
    },
    recentActivity,
  };
};
