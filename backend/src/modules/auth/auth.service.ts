import bcrypt from 'bcrypt';
import prisma from '../../config/db';
import { generateToken } from '../../utils/jwt';
import { ensureDefaultPlans } from '../organizations/subscription.service';

export const registerOwner = async (data: any) => {
  const { name, libraryName, email, mobile, password, address, totalResources, nicheType } = data;

  // Check if owner with email or mobile already exists
  const existingOwner = await prisma.owner.findFirst({
    where: {
      OR: [{ email }, { mobile }],
    },
  });

  if (existingOwner) {
    throw new Error('Owner with this email or mobile already exists');
  }

  // Ensure default plans exist
  await ensureDefaultPlans();

  // Get the Trial plan
  const trialPlan = await prisma.plan.findFirst({
    where: { name: 'Free Trial' },
  });

  if (!trialPlan) {
    throw new Error('System error: Trial plan not found');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create Owner, Organization, and Subscription in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const owner = await tx.owner.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
      },
    });

    const organization = await tx.organization.create({
      data: {
        ownerId: owner.id,
        businessName: libraryName,
        nicheType: nicheType || 'LIBRARY',
        address,
        totalResources,
      },
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + trialPlan.durationDays);

    await tx.subscription.create({
      data: {
        organizationId: organization.id,
        planId: trialPlan.id,
        status: 'TRIAL',
        startDate,
        endDate,
      },
    });

    return { owner, organization };
  });

  const token = generateToken({
    ownerId: result.owner.id,
    organizationId: result.organization.id,
    role: result.owner.role,
  });

  return {
    token,
    owner: {
      id: result.owner.id,
      name: result.owner.name,
      email: result.owner.email,
      role: result.owner.role,
    },
    organization: {
      id: result.organization.id,
      businessName: result.organization.businessName,
      nicheType: result.organization.nicheType,
    },
  };
};

export const loginOwner = async (data: any) => {
  const { email, password } = data;

  const owner = await prisma.owner.findUnique({
    where: { email },
    include: {
      organizations: true,
      employerOrg: true,
    },
  });

  if (!owner) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, owner.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  if (owner.role !== 'STAFF' && owner.organizations.length === 0) {
    throw new Error('No organization found for this owner');
  }

  if (owner.role === 'STAFF' && !owner.employerOrg) {
    throw new Error('No organization found for this staff member');
  }

  // Assuming one organization per owner for now, based on initial setup
  const organization = owner.role === 'STAFF' ? owner.employerOrg! : owner.organizations[0];

  const token = generateToken({
    ownerId: owner.id,
    organizationId: organization.id,
    role: owner.role,
  });

  return {
    token,
    owner: {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      role: owner.role,
    },
    organization: {
      id: organization.id,
      businessName: organization.businessName,
      nicheType: organization.nicheType,
    },
  };
};
