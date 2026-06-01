ALTER TABLE "users" ADD COLUMN "account_points" integer DEFAULT 0 NOT NULL;

UPDATE "users"
SET "account_points" = COALESCE("total_points", 0),
    "current_level_id" = CASE
      WHEN COALESCE("total_points", 0) >= 5000 THEN 6
      WHEN COALESCE("total_points", 0) >= 2000 THEN 5
      WHEN COALESCE("total_points", 0) >= 1000 THEN 4
      WHEN COALESCE("total_points", 0) >= 500 THEN 3
      WHEN COALESCE("total_points", 0) >= 100 THEN 2
      ELSE 1
    END;