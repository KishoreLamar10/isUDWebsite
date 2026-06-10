ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';

CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED');

CREATE TABLE "ProjectSubmission" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedTo" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectSubmission_token_key" ON "ProjectSubmission"("token");
CREATE INDEX "ProjectSubmission_projectId_status_idx" ON "ProjectSubmission"("projectId", "status");

ALTER TABLE "ProjectSubmission"
ADD CONSTRAINT "ProjectSubmission_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
