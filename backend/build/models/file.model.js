"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileModel = void 0;
// src/models/file.model.ts
const database_1 = require("../database");
const schema_1 = require("../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.FileModel = {
    getAll: async () => {
        return await database_1.db.select().from(schema_1.files).all();
    },
    getByName: async (name) => {
        const [file] = await database_1.db.select().from(schema_1.files).where((0, drizzle_orm_1.eq)(schema_1.files.name, name));
        return file;
    },
    create: async (fileData) => {
        const [newFile] = await database_1.db.insert(schema_1.files).values(fileData).returning();
        return newFile;
    },
    updateContent: async (name, content) => {
        const [updated] = await database_1.db
            .update(schema_1.files)
            .set({ content, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.files.name, name))
            .returning();
        return updated;
    },
    delete: async (name) => {
        try {
            await database_1.db.delete(schema_1.files).where((0, drizzle_orm_1.eq)(schema_1.files.name, name));
            return true;
        }
        catch (error) {
            console.log('error:', error);
            return false;
        }
    },
    rename: async (oldName, newName) => {
        const [renamed] = await database_1.db
            .update(schema_1.files)
            .set({ name: newName, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.files.name, oldName))
            .returning();
        return renamed;
    }
};
