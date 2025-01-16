ALTER TABLE "vehicles" ADD COLUMN "city" varchar(100) NOT NULL DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "price" numeric NOT NULL DEFAULT 0.00;