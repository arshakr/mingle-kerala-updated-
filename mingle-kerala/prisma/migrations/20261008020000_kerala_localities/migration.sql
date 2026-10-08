ALTER TABLE "User" ADD COLUMN "locality" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "showLocality" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "User_district_locality_showLocality_idx" ON "User"("district", "locality", "showLocality");
