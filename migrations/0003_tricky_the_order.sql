CREATE TABLE IF NOT EXISTS "blacklisttokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"expire_time" bigint
);
