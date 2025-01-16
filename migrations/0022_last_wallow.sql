CREATE TABLE IF NOT EXISTS "userDevices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fcm_token" varchar(255) DEFAULT null,
	"device_id" varchar NOT NULL,
	"device_name" varchar NOT NULL,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userDevices_fcm_token_unique" UNIQUE("fcm_token"),
	CONSTRAINT "userDevices_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userDevices" ADD CONSTRAINT "userDevices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "fcm_token";