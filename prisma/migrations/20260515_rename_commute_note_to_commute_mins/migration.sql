-- AlterTable: rename commute_note (text) to commute_mins (int)
ALTER TABLE "apartments" RENAME COLUMN "commute_note" TO "commute_mins_text";
ALTER TABLE "apartments" ADD COLUMN "commute_mins" INTEGER;
UPDATE "apartments" SET "commute_mins" = NULL;
ALTER TABLE "apartments" DROP COLUMN "commute_mins_text";
