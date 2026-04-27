ALTER TABLE "Project" ADD COLUMN "projectNumber" SERIAL;

CREATE UNIQUE INDEX "Project_projectNumber_key" ON "Project"("projectNumber");
