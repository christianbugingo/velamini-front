-- CreateTable
CREATE TABLE "data_analyses" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "columnNames" JSONB NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL,
    "insights" JSONB NOT NULL DEFAULT '[]',
    "charts" JSONB NOT NULL DEFAULT '[]',
    "decisions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_analyses_orgId_idx" ON "data_analyses"("orgId");

-- AddForeignKey
ALTER TABLE "data_analyses" ADD CONSTRAINT "data_analyses_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
