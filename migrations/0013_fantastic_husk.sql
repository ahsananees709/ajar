ALTER TABLE "vehicles" ADD COLUMN "driver_price" numeric DEFAULT 0;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "delivery_available" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "delivery_price" numeric DEFAULT 0;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "is_ac" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "is_gps" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "is_usb" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "is_charger" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "is_bluetooth" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "is_sunroof" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "is_push_button_start" boolean DEFAULT false;