CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "uuid" varchar(36);
--> statement-breakpoint
UPDATE "orders" SET "uuid" = gen_random_uuid()::text WHERE "uuid" IS NULL;
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "uuid" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_uuid_unique" UNIQUE("uuid");
