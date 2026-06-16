-- Constraints must be dropped before renaming
ALTER TABLE "Library" DROP CONSTRAINT IF EXISTS "Library_ownerId_fkey";
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_libraryId_fkey";
ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_libraryId_fkey";
ALTER TABLE "Seat" DROP CONSTRAINT IF EXISTS "Seat_studentId_fkey";
ALTER TABLE "Seat" DROP CONSTRAINT IF EXISTS "Seat_libraryId_fkey";
ALTER TABLE "Membership" DROP CONSTRAINT IF EXISTS "Membership_studentId_fkey";
ALTER TABLE "FeeRecord" DROP CONSTRAINT IF EXISTS "FeeRecord_studentId_fkey";
ALTER TABLE "FeeRecord" DROP CONSTRAINT IF EXISTS "FeeRecord_libraryId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_libraryId_fkey";

-- Rename tables
ALTER TABLE "Library" RENAME TO "Organization";
ALTER TABLE "Student" RENAME TO "Member";
ALTER TABLE "Seat" RENAME TO "Resource";

-- Rename columns
ALTER TABLE "Organization" RENAME COLUMN "name" TO "businessName";
ALTER TABLE "Organization" RENAME COLUMN "totalSeats" TO "totalResources";
ALTER TABLE "Resource" RENAME COLUMN "seatNumber" TO "resourceName";
ALTER TABLE "Resource" RENAME COLUMN "libraryId" TO "organizationId";
ALTER TABLE "Resource" RENAME COLUMN "studentId" TO "memberId";
ALTER TABLE "Member" RENAME COLUMN "libraryId" TO "organizationId";
ALTER TABLE "Subscription" RENAME COLUMN "libraryId" TO "organizationId";
ALTER TABLE "Membership" RENAME COLUMN "libraryId" TO "organizationId";
ALTER TABLE "Membership" RENAME COLUMN "studentId" TO "memberId";
ALTER TABLE "FeeRecord" RENAME COLUMN "libraryId" TO "organizationId";
ALTER TABLE "FeeRecord" RENAME COLUMN "studentId" TO "memberId";
ALTER TABLE "ActivityLog" RENAME COLUMN "libraryId" TO "organizationId";
ALTER TABLE "Notification" RENAME COLUMN "libraryId" TO "organizationId";

-- Add new columns
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "nicheType" TEXT NOT NULL DEFAULT 'LIBRARY';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "ownerName" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "membershipStart" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "membershipEnd" TIMESTAMP(3);
