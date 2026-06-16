import * as xlsx from 'xlsx';
import prisma from '../../config/db';
import { getCurrentSubscription } from '../organizations/subscription.service';

export const importStudents = async (organizationId: string, fileBuffer: Buffer) => {
  // Check subscription limits before starting import
  const subscription = await getCurrentSubscription(organizationId);
  if (subscription.status === 'EXPIRED') {
    throw new Error('Your subscription has expired. Please upgrade to import members.');
  }

  const currentStudentCount = await prisma.member.count({
    where: { organizationId },
  });

  let availableSlots = subscription.plan.maxStudents - currentStudentCount;
  if (availableSlots <= 0) {
    throw new Error(`You have reached the maximum limit of ${subscription.plan.maxStudents} members. Please upgrade to import more.`);
  }

  // Parse the workbook
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rows: any[] = xlsx.utils.sheet_to_json(worksheet);

  let imported = 0;
  let failed = 0;
  const errors: any[] = [];

  for (const [index, row] of rows.entries()) {
    try {
      const name = row['Name'] || row['name'];
      const mobile = String(row['Mobile'] || row['mobile'] || '');
      const parentMobile = row['Parent Mobile'] || row['parentMobile'] ? String(row['Parent Mobile'] || row['parentMobile']) : null;
      const address = row['Address'] || row['address'] || null;

      if (!name || name.length < 2) {
        throw new Error('Name is missing or too short');
      }

      if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
        throw new Error('Invalid mobile number format. Must be 10 digits.');
      }

      // We use a transaction for each member or do them sequentially since bulk upsert might fail entirely if one fails.
      await prisma.$transaction(async (tx) => {
        const existingStudent = await tx.member.findFirst({
          where: { organizationId, mobile },
        });

        if (existingStudent) {
          throw new Error(`Member with mobile ${mobile} already exists.`);
        }

        const member = await tx.member.create({
          data: {
            organizationId,
            name,
            mobile,
            parentMobile,
            address,
            status: 'ACTIVE', // Default status for imported members
          },
        });

        // Log Activity
        await tx.activityLog.create({
          data: {
            organizationId,
            action: 'MEMBER_IMPORTED',
            details: { memberId: member.id, name: member.name },
          },
        });
      });

      imported++;
      availableSlots--;

      if (availableSlots <= 0) {
        throw new Error('Subscription limit reached during import. Stopping further imports.');
      }
    } catch (error: any) {
      failed++;
      errors.push({ row: index + 2, error: error.message, data: row });
    }
  }

  return {
    imported,
    failed,
    errors,
  };
};
