CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'draft',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"participant_points" integer DEFAULT 0,
	"organizer_id" integer
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'registered',
	"attended" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "is_active" TO "last_name";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_name" varchar(150);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(20) DEFAULT 'student';--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;