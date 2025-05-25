import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  created: integer("created", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`)
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;