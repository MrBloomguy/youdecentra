import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  walletAddress: text("wallet_address").notNull().unique(),
  email: text("email"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  email: true,
  username: true,
  avatar: true,
});

// Community schema
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  avatar: text("avatar"),
  banner: text("banner"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  orbisContext: text("orbis_context"),
  memberCount: integer("member_count").default(0).notNull(),
});

export const insertCommunitySchema = createInsertSchema(communities).pick({
  name: true,
  description: true,
  avatar: true,
  banner: true,
  createdBy: true,
  orbisContext: true,
});

// Post schema (to track basic info, content stored via Orbis)
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  communityId: integer("community_id").notNull(),
  authorId: text("author_id").notNull(),
  orbisPostId: text("orbis_post_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  communityId: true,
  authorId: true,
  orbisPostId: true,
  mediaUrls: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
