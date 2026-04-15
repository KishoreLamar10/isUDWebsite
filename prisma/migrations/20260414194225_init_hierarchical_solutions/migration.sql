/*
  Warnings:

  - You are about to drop the column `facilityUses` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('IMPLEMENTED', 'NOT_IMPLEMENTED', 'PARTIAL', 'NOT_APPLICABLE');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "facilityUses";

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalCredits" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalCredits" DOUBLE PRECISION NOT NULL,
    "chapterId" TEXT NOT NULL,
    "minPoints1" INTEGER NOT NULL DEFAULT 0,
    "minPoints2" INTEGER NOT NULL DEFAULT 0,
    "minPoints3" INTEGER NOT NULL DEFAULT 0,
    "detailedInstruction" TEXT,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubSection" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalCredits" DOUBLE PRECISION NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "SubSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "standardNumber" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "instruction" TEXT,
    "sectionId" TEXT NOT NULL,
    "subSectionId" TEXT,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Figure" (
    "id" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "number" TEXT,
    "caption" TEXT,
    "altTag" TEXT,
    "url" TEXT,

    CONSTRAINT "Figure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityUse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FacilityUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectResponse" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "status" "ResponseStatus" NOT NULL DEFAULT 'NOT_IMPLEMENTED',
    "notes" TEXT,
    "evidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GoalToSolution" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PhaseToSolution" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FacilityUseToSection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FacilityUseToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_number_key" ON "Chapter"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Section_number_key" ON "Section"("number");

-- CreateIndex
CREATE UNIQUE INDEX "SubSection_number_key" ON "SubSection"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_standardNumber_key" ON "Solution"("standardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_abbr_key" ON "Goal"("abbr");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_name_key" ON "Phase"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityUse_name_key" ON "FacilityUse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectResponse_projectId_solutionId_key" ON "ProjectResponse"("projectId", "solutionId");

-- CreateIndex
CREATE UNIQUE INDEX "_GoalToSolution_AB_unique" ON "_GoalToSolution"("A", "B");

-- CreateIndex
CREATE INDEX "_GoalToSolution_B_index" ON "_GoalToSolution"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PhaseToSolution_AB_unique" ON "_PhaseToSolution"("A", "B");

-- CreateIndex
CREATE INDEX "_PhaseToSolution_B_index" ON "_PhaseToSolution"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FacilityUseToSection_AB_unique" ON "_FacilityUseToSection"("A", "B");

-- CreateIndex
CREATE INDEX "_FacilityUseToSection_B_index" ON "_FacilityUseToSection"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FacilityUseToProject_AB_unique" ON "_FacilityUseToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_FacilityUseToProject_B_index" ON "_FacilityUseToProject"("B");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_subSectionId_fkey" FOREIGN KEY ("subSectionId") REFERENCES "SubSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Figure" ADD CONSTRAINT "Figure_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResponse" ADD CONSTRAINT "ProjectResponse_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResponse" ADD CONSTRAINT "ProjectResponse_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoalToSolution" ADD CONSTRAINT "_GoalToSolution_A_fkey" FOREIGN KEY ("A") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoalToSolution" ADD CONSTRAINT "_GoalToSolution_B_fkey" FOREIGN KEY ("B") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhaseToSolution" ADD CONSTRAINT "_PhaseToSolution_A_fkey" FOREIGN KEY ("A") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhaseToSolution" ADD CONSTRAINT "_PhaseToSolution_B_fkey" FOREIGN KEY ("B") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilityUseToSection" ADD CONSTRAINT "_FacilityUseToSection_A_fkey" FOREIGN KEY ("A") REFERENCES "FacilityUse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilityUseToSection" ADD CONSTRAINT "_FacilityUseToSection_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilityUseToProject" ADD CONSTRAINT "_FacilityUseToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "FacilityUse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilityUseToProject" ADD CONSTRAINT "_FacilityUseToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
