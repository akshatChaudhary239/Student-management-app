import prisma from '../../config/db';

export const renewMembership = async (organizationId: string, data: any) => {
  const { memberId, startDate, endDate, feeAmount } = data;

  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Create the membership record
    const membership = await tx.membership.create({
      data: {
        organizationId,
        memberId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        feeAmount,
      },
    });

    // Determine status: if end date is in the future, they are ACTIVE.
    const isExpired = new Date(endDate) < new Date();
    const newStatus = isExpired ? 'EXPIRED' : 'ACTIVE';

    // Update member status
    await tx.member.update({
      where: { id: memberId },
      data: { status: newStatus },
    });

    // Log Activity
    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'MEMBERSHIP_RENEWED',
        details: { memberId, name: member.name, endDate, feeAmount },
      },
    });

    return membership;
  });
};

export const getExpiringMemberships = async (organizationId: string, daysThreshold: number = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thresholdDate = new Date(today);
  thresholdDate.setDate(today.getDate() + daysThreshold);

  // Find the latest membership for each member using a custom query or sorting
  // Prisma doesn't support easy "distinct on" yet, so we fetch members with their latest membership
  const members = await prisma.member.findMany({
    where: { organizationId },
    include: {
      memberships: {
        orderBy: { endDate: 'desc' },
        take: 1,
      },
    },
  });

  const expiringStudents = members.filter((member) => {
    if (member.memberships.length === 0) return false;
    
    const latestMembership = member.memberships[0];
    const endDate = new Date(latestMembership.endDate);
    
    // Check if it expires within the threshold OR is already expired (but maybe status hasn't synced)
    return endDate <= thresholdDate;
  });

  return expiringStudents.map((s) => ({
    id: s.id,
    name: s.name,
    mobile: s.mobile,
    status: s.status,
    membershipEndDate: s.memberships[0].endDate,
  })).sort((a, b) => new Date(a.membershipEndDate).getTime() - new Date(b.membershipEndDate).getTime());
};
