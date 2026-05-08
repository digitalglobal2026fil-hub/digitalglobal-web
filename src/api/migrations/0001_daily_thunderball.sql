CREATE TABLE `access_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`hotmart_order_id` text,
	`used` integer DEFAULT false NOT NULL,
	`used_at` text,
	`expires_at` text,
	`created_at` text DEFAULT '2026-05-07T17:07:10.699Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_codes_code_unique` ON `access_codes` (`code`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`instagram` text,
	`answers` text NOT NULL,
	`profile` text,
	`access_code` text,
	`created_at` text DEFAULT '2026-05-07T17:07:10.698Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_leads`("id", "name", "email", "instagram", "answers", "profile", "access_code", "created_at") SELECT "id", "name", "email", "instagram", "answers", "profile", "access_code", "created_at" FROM `leads`;--> statement-breakpoint
DROP TABLE `leads`;--> statement-breakpoint
ALTER TABLE `__new_leads` RENAME TO `leads`;--> statement-breakpoint
PRAGMA foreign_keys=ON;