DO $$ BEGIN
 CREATE TYPE "public"."driver_availability" AS ENUM('Only with driver', 'Driver available on Demand', 'Without Driver');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."fuel_type" AS ENUM('Gasoline', 'Diesel', 'Electric', 'Hybrid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transmission_type" AS ENUM('Auto', 'Manual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."vehicle_type" AS ENUM('Cars', 'SUVs', 'Minivans', 'Box Trucks', 'Trucks', 'Vans', 'Cargo Vans');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_id" uuid,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"full_address" text NOT NULL,
	"vin_number" varchar(17) NOT NULL,
	"make" varchar(50) NOT NULL,
	"model" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"vehicle_type" "vehicle_type" NOT NULL,
	"color" varchar(20) NOT NULL,
	"reason_for_hosting" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"transmission_type" "transmission_type" NOT NULL,
	"fuel_type" "fuel_type" NOT NULL,
	"mileage" integer NOT NULL,
	"seats" integer NOT NULL,
	"engine_size" varchar(10) NOT NULL,
	"pictures" jsonb NOT NULL,
	"registration_number" varchar(20) NOT NULL,
	"license_plate" varchar(20) NOT NULL,
	"is_available" boolean DEFAULT true,
	"description" text,
	"driver_availability" "driver_availability" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_vin_number_unique" UNIQUE("vin_number"),
	CONSTRAINT "vehicles_license_plate_unique" UNIQUE("license_plate")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
