import prisma from '../../config/db';

export const recordFee = async (organizationId: string, data: any) => {
  const { memberId, amount, paymentDate, paymentMethod } = data;

  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const feeRecord = await tx.feeRecord.create({
      data: {
        organizationId,
        memberId,
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod,
      },
    });

    // Log Activity
    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'FEE_RECEIVED',
        details: { memberId, name: member.name, amount, paymentMethod },
      },
    });

    return feeRecord;
  });
};

export const getStudentFeeHistory = async (organizationId: string, memberId: string) => {
  // Ensure the member belongs to this organization
  const member = await prisma.member.findFirst({
    where: { id: memberId, organizationId },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  return await prisma.feeRecord.findMany({
    where: { organizationId, memberId },
    orderBy: { paymentDate: 'desc' },
  });
};

export const getAllFees = async (organizationId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [fees, total] = await Promise.all([
    prisma.feeRecord.findMany({
      where: { organizationId },
      include: {
        member: {
          select: {
            name: true,
            mobile: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.feeRecord.count({ where: { organizationId } }),
  ]);

  return {
    fees,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
