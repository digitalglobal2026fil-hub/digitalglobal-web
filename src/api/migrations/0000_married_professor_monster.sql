CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`instagram` text,
	`answers` text NOT NULL,
	`profile` text,
	`created_at` text DEFAULT '2026-05-07T16:52:28.110Z' NOT NULL
);
