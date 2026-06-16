ALTER INDEX IF EXISTS "Library_pkey" RENAME TO "Organization_pkey";
ALTER INDEX IF EXISTS "Student_pkey" RENAME TO "Member_pkey";
ALTER INDEX IF EXISTS "Seat_pkey" RENAME TO "Resource_pkey";
ALTER INDEX IF EXISTS "Seat_studentId_key" RENAME TO "Resource_memberId_key";
