import prisma from '../../config/db';

export const getSeats = async (organizationId: string) => {
  // Fetch the organization to get totalResources
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { totalResources: true },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Fetch all occupied resources
  const occupiedSeats = await prisma.resource.findMany({
    where: { organizationId, memberId: { not: null } },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          mobile: true,
        },
      },
    },
  });

  return {
    totalResources: organization.totalResources,
    occupiedSeats,
  };
};

export const assignSeat = async (organizationId: string, memberId: string, resourceName: string) => {
  return await prisma.$transaction(async (tx) => {
    // Check if member belongs to organization and is active
    const member = await tx.member.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.status !== 'ACTIVE') {
      throw new Error('Cannot assign a resource to an inactive member');
    }

    // Check if the resource is already occupied by someone else
    const targetSeat = await tx.resource.findFirst({
      where: { organizationId, resourceName },
    });

    if (targetSeat && targetSeat.memberId && targetSeat.memberId !== memberId) {
      throw new Error(`Resource ${resourceName} is already occupied`);
    }

    // Check if the member already has a resource
    const currentSeat = await tx.resource.findFirst({
      where: { organizationId, memberId },
    });

    if (currentSeat) {
      if (currentSeat.resourceName === resourceName) {
        // Already assigned to this resource
        return currentSeat;
      }

      // Free up the old resource
      await tx.resource.update({
        where: { id: currentSeat.id },
        data: { memberId: null },
      });
    }

    // Assign the new resource
    let assignedSeat;
    if (targetSeat) {
      assignedSeat = await tx.resource.update({
        where: { id: targetSeat.id },
        data: { memberId },
      });
    } else {
      assignedSeat = await tx.resource.create({
        data: {
          organizationId,
          resourceName,
          memberId,
        },
      });
    }

    // Log Activity
    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'SEAT_ASSIGNED',
        details: { memberId, name: member.name, resourceName },
      },
    });

    return assignedSeat;
  });
};

export const unassignSeat = async (organizationId: string, memberId: string) => {
  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const currentSeat = await tx.resource.findFirst({
      where: { organizationId, memberId },
    });

    if (!currentSeat) {
      throw new Error('Member does not have a resource assigned');
    }

    await tx.resource.update({
      where: { id: currentSeat.id },
      data: { memberId: null },
    });

    // Log Activity
    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'SEAT_UNASSIGNED',
        details: { memberId, name: member.name, resourceName: currentSeat.resourceName },
      },
    });

    return { message: 'Resource unassigned successfully' };
  });
};
