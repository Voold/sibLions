ALTER TABLE "events" ADD COLUMN "uuid" varchar(36);
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
UPDATE "events" SET "uuid" = gen_random_uuid()::text WHERE "uuid" IS NULL;
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "uuid" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_uuid_unique" UNIQUE("uuid");
