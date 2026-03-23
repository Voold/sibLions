CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1,
	"total_points" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "points_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"points" integer NOT NULL,
	"points_type" varchar(50),
	"description" varchar(255),
	"event_id" integer,
	"registration_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(20),
	"price" integer NOT NULL,
	"stock" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active',
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"achievement_type" varchar(50) NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"achieved_at" timestamp DEFAULT now(),
	"badge_image" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_organizer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_current_level_id_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event_type" varchar(20);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "registration_deadline" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "fan_points" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "max_participants" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" varchar(200);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "levels" ADD COLUMN "benefits" text;--> statement-breakpoint
ALTER TABLE "levels" ADD COLUMN "badge_image" varchar(255);--> statement-breakpoint
ALTER TABLE "levels" ADD COLUMN "requirements" text;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "role" varchar(20);--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "attended_at" timestamp;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "registered_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "middle_name" varchar(150);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "faculty" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "course" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "group_name" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(15);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "telegram" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "achievements" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_points_history_user" ON "points_history" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_current_level_id_levels_id_fk" FOREIGN KEY ("current_level_id") REFERENCES "public"."levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_registrations_event" ON "registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_users_tpu_id" ON "users" USING btree ("tpu_id");--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_event_id_unique" UNIQUE("user_id","event_id");