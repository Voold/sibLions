CREATE TABLE "levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"min_points" integer NOT NULL,
	"description" text,
	"color" varchar(20),
	CONSTRAINT "levels_min_points_unique" UNIQUE("min_points")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(150) NOT NULL,
	"email" varchar(254) NOT NULL,
	"tpu_id" varchar(20),
	"total_points" integer DEFAULT 0,
	"current_level_id" integer,
	"date_joined" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_tpu_id_unique" UNIQUE("tpu_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_current_level_id_levels_id_fk" FOREIGN KEY ("current_level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;