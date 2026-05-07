-- Product statuses now map to Ongoing, Certified, and Inactive only.
-- COMPLETED remains the database value for Certified to avoid a larger rename.
UPDATE "Project"
SET "status" = 'ONGOING'
WHERE "status" IN ('PENDING', 'IN_REVIEW');

ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";

CREATE TYPE "ProjectStatus" AS ENUM ('ONGOING', 'COMPLETED', 'INACTIVE');

ALTER TABLE "Project"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ProjectStatus"
    USING "status"::text::"ProjectStatus",
  ALTER COLUMN "status" SET DEFAULT 'ONGOING';

DROP TYPE "ProjectStatus_old";
