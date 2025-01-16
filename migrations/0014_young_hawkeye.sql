ALTER TABLE "bookings" ADD COLUMN "invoice" json DEFAULT 'null'::json;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "renter_address" json DEFAULT 'null'::json;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "with_driver" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "with_delivery" boolean DEFAULT false;