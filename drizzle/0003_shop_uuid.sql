CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "uuid" varchar(36);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "points" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE "products" SET "uuid" = gen_random_uuid()::text WHERE "uuid" IS NULL;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "uuid" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_uuid_unique" UNIQUE("uuid");