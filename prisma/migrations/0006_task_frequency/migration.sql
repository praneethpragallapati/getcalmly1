-- AlterTable: task recurrence (ONE_TIME / DAILY / WEEKLY / FORTNIGHTLY / MONTHLY).
ALTER TABLE "Task" ADD COLUMN "frequency" TEXT;
