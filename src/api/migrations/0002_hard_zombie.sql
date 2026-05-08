CREATE TABLE `otp_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`access_code` text NOT NULL,
	`email` text NOT NULL,
	`otp` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT '2026-05-07T17:32:43.870Z' NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_access_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`hotmart_order_id` text,
	`used` integer DEFAULT false NOT NULL,
	`used_at` text,
	`expires_at` text,
	`created_at` text DEFAULT '2026-05-07T17:32:43.870Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_access_codes`("id", "code", "email", "name", "hotmart_order_id", "used", "used_at", "expires_at", "created_at") SELECT "id", "code", "email", "name", "hotmart_order_id", "used", "used_at", "expires_at", "created_at" FROM `access_codes`;--> statement-breakpoint
DROP TABLE `access_codes`;--> statement-breakpoint
ALTER TABLE `__new_access_codes` RENAME TO `access_codes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `access_codes_code_unique` ON `access_codes` (`code`);--> statement-breakpoint
CREATE TABLE `__new_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`instagram` text,
	`answers` text NOT NULL,
	`profile` text,
	`access_code` text,
	`created_at` text DEFAULT '2026-05-07T17:32:43.869Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_leads`("id", "name", "email", "instagram", "answers", "profile", "access_code", "created_at") SELECT "id", "name", "email", "instagram", "answers", "profile", "access_code", "created_at" FROM `leads`;--> statement-breakpoint
DROP TABLE `leads`;--> statement-breakpoint
ALTER TABLE `__new_leads` RENAME TO `leads`;