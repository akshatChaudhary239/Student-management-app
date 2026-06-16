import prisma from '../../config/db';
import { checkStudentLimit } from '../organizations/subscription.service';

export const createStudent = async (organizationId: string, data: any) => {
  let { name, mobile, parentMobile, address, batch, notes, resourceName, membershipStartDate, membershipEndDate, feeAmount, membershipMonths } = data;

  // Calculate dates if membershipMonths is provided and dates are not
  if (membershipMonths && !membershipStartDate && !membershipEndDate) {
    membershipStartDate = new Date();
    membershipEndDate = new Date();
    membershipEndDate.setMonth(membershipEndDate.getMonth() + membershipMonths);
  }

  // Enforce SaaS Subscription Limits
  await checkStudentLimit(organizationId);

  return await prisma.$transaction(async (tx) => {
    // Check if a member with this mobile already exists in the same organization
    const existingStudent = await tx.member.findFirst({
      where: { organizationId, mobile },
    });

    if (existingStudent) {
      throw new Error('A member with this mobile number already exists in this organization');
    }

    // Determine initial status based on membership dates
    let status = 'ACTIVE';
    if (membershipEndDate && new Date(membershipEndDate) < new Date()) {
      status = 'EXPIRED';
    } else if (!membershipStartDate || !membershipEndDate) {
      status = 'ACTIVE'; // Default to active if no dates
    }

    // Create the member
    const member = await tx.member.create({
      data: {
        organizationId,
        name,
        mobile,
        parentMobile,
        address,
        batch,
        notes,
        status,
      },
    });

    // Handle initial resource assignment if provided
    if (resourceName) {
      // Check if resource is already occupied
      const resource = await tx.resource.findFirst({
        where: { organizationId, resourceName },
      });

      if (resource && resource.memberId) {
        throw new Error(`Resource ${resourceName} is already occupied`);
      }

      if (resource) {
        await tx.resource.update({
          where: { id: resource.id },
          data: { memberId: member.id },
        });
      } else {
        await tx.resource.create({
          data: {
            organizationId,
            resourceName,
            memberId: member.id,
          },
        });
      }
    }

    // Handle initial membership
    if (membershipStartDate && membershipEndDate && feeAmount !== undefined) {
      await tx.membership.create({
        data: {
          organizationId,
          memberId: member.id,
          startDate: new Date(membershipStartDate),
          endDate: new Date(membershipEndDate),
          feeAmount,
        },
      });
    }

    // Log Activity
    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'STUDENT_CREATED',
        details: { memberId: member.id, name: member.name },
      },
    });

    return member;
  });
};

export const getStudents = async (organizationId: string, page: number = 1, limit: number = 20, search?: string) => {
  const skip = (page - 1) * limit;

  const where: any = { organizationId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
    ];
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: { resource: true },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.member.count({ where }),
  ]);

  return {
    members,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getStudentById = async (organizationId: string, memberId: string) => {
  const member = await prisma.member.findFirst({
    where: { id: memberId, organizationId },
    include: {
      resource: true,
      memberships: {
        orderBy: { startDate: 'desc' },
      },
    },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  return member;
};

export const updateStudent = async (organizationId: string, memberId: string, data: any) => {
  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const updatedStudent = await tx.member.update({
      where: { id: memberId },
      data,
    });

    // Log Activity
    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'STUDENT_UPDATED',
        details: { memberId: updatedStudent.id, name: updatedStudent.name, updates: data },
      },
    });

    return updatedStudent;
  });
};

export const renewStudent = async (organizationId: string, memberId: string, data: any) => {
  const { feeAmount, paymentMode, months } = data;

  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: { id: memberId, organizationId },
      include: {
        memberships: {
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    });

    if (!member) throw new Error('Member not found');

    const lastMembership = member.memberships[0];
    const now = new Date();
    
    let startDate = now;
    if (lastMembership && new Date(lastMembership.endDate) > now) {
      startDate = new Date(lastMembership.endDate);
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const membership = await tx.membership.create({
      data: {
        organizationId,
        memberId,
        startDate,
        endDate,
        feeAmount
      }
    });

    await tx.feeRecord.create({
      data: {
        organizationId,
        memberId,
        amount: feeAmount,
        paymentDate: now,
        paymentMethod: paymentMode || 'CASH'
      }
    });

    await tx.member.update({
      where: { id: memberId },
      data: { status: 'ACTIVE' }
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'STUDENT_RENEWED',
        details: { memberId, name: member.name, months, feeAmount }
      }
    });

    return membership;
  });
};

export const cancelStudent = async (organizationId: string, memberId: string) => {
  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: { id: memberId, organizationId },
      include: { resource: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // 1. Set member status to LEFT
    const updatedMember = await tx.member.update({
      where: { id: memberId },
      data: { status: 'LEFT' },
    });

    // 2. Release resource if any
    if (member.resource) {
      await tx.resource.update({
        where: { id: member.resource.id },
        data: { memberId: null },
      });
    }

    // 3. Log Activity
    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'STUDENT_CANCELLED',
        details: { memberId: member.id, name: member.name },
      },
    });

    return updatedMember;
  });
};

export const deleteStudent = async (organizationId: string, memberId: string) => {
  return await prisma.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Free resource if any
    await tx.resource.updateMany({
      where: { memberId },
      data: { memberId: null },
    });

    // Delete related records safely
    await tx.membership.deleteMany({ where: { memberId } });
    await tx.feeRecord.deleteMany({ where: { memberId } });

    // Log Activity before deletion
    await tx.activityLog.create({
      data: {
        organizationId,
        action: 'STUDENT_REMOVED',
        details: { memberId: member.id, name: member.name },
      },
    });

    // Finally delete member
    await tx.member.delete({
      where: { id: memberId },
    });

    return { success: true };
  });
};
