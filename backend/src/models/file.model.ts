import { db } from '../database'
import { files, type File, type NewFile } from '../database/schema'
import { eq } from 'drizzle-orm'

export const FileModel = {
  getAll: async (): Promise<File[]> => {
    return await db.select().from(files).all()
  },

  getByName: async (name: string): Promise<File | undefined> => {
    const [file] = await db.select().from(files).where(eq(files.name, name))
    return file
  },

  create: async (fileData: NewFile): Promise<File | undefined> => {
    const [newFile] = await db.insert(files).values(fileData).returning()
    return newFile
  },

  updateContent: async (name: string, content: string): Promise<File | undefined> => {
    const [updated] = await db
      .update(files)
      .set({ content, updatedAt: new Date() })
      .where(eq(files.name, name))
      .returning()
    return updated
  },

  delete: async (name: string): Promise<boolean> => {
    try {
      await db.delete(files).where(eq(files.name, name))
      return true
    } catch (error) {
      console.log('error:', error)

      return false
    }
  },

  rename: async (oldName: string, newName: string): Promise<File | undefined> => {
    const [renamed] = await db
      .update(files)
      .set({ name: newName, updatedAt: new Date() })
      .where(eq(files.name, oldName))
      .returning()
    return renamed
  }
}
