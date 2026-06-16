import prisma from '../../config/db';

export const getActivities = async (
  organizationId: string,
  page: number = 1,
  limit: number = 20,
  actionFilter?: string
) => {
  const skip = (page - 1) * limit;

  // Build the dynamic where clause
  const whereClause: any = {
    organizationId,
  };

  if (actionFilter) {
    whereClause.action = actionFilter;
  }

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where: whereClause }),
  ]);

  return {
    activities,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
