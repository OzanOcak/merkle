"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = void 0;
// src/database/schema.ts
const drizzle_orm_1 = require("drizzle-orm");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.files = (0, sqlite_core_1.sqliteTable)('files', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull().unique(),
    content: (0, sqlite_core_1.text)('content').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql) `(strftime('%s', 'now'))`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).default((0, drizzle_orm_1.sql) `(strftime('%s', 'now'))`)
});
