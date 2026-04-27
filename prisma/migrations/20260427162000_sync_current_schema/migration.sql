-- CreateEnum
CREATE TYPE "TeamPermission" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('PROJECT_MANAGER', 'ARCHITECT', 'CONSULTANT', 'DEVELOPMENT', 'OWNERSHIP', 'HR', 'ADVOCATE');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'PENDING');

-- DropIndex
DROP INDEX "Section_number_key";

-- DropIndex
DROP INDEX "SubSection_number_key";

-- AlterTable
ALTER TABLE "Solution" ADD COLUMN "isMandatory" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "permission" "TeamPermission" NOT NULL DEFAULT 'VIEWER',
    "role" "ProjectRole" NOT NULL DEFAULT 'ARCHITECT',
    "status" "TeamStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionToggle" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SectionToggle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_projectId_email_key" ON "TeamMember"("projectId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "SectionToggle_projectId_sectionId_key" ON "SectionToggle"("projectId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_chapterId_number_key" ON "Section"("chapterId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "SubSection_sectionId_number_key" ON "SubSection"("sectionId", "number");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionToggle" ADD CONSTRAINT "SectionToggle_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionToggle" ADD CONSTRAINT "SectionToggle_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
