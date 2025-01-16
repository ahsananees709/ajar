ALTER TABLE "permissions" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "roles" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_name_unique";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_name_unique";--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_title_unique" UNIQUE("title");--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_title_unique" UNIQUE("title");