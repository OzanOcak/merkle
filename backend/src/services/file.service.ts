import { FileModel } from '../models/file.model'
import { NewFile, File } from '../database/schema'

export const FileService = (): {
  getAllFiles: () => Promise<File[]>
  getFileByName: (name: string) => Promise<File | undefined>
  createFile: (fileData: NewFile) => Promise<File | undefined>
  deleteFile: (name: string) => Promise<boolean>
  updateFileContent: (name: string, content: string) => Promise<File | null>
  renameFile: (oldName: string, newName: string) => Promise<File | null>
} => {
  return {
    getAllFiles: async (): Promise<File[]> => {
      return await FileModel.getAll()
    },

    getFileByName: async (name: string): Promise<File | undefined> => {
      return await FileModel.getByName(name)
    },

    createFile: async (fileData: NewFile): Promise<File | undefined> => {
      if (!fileData.name) {
        throw new Error('File name is required')
      }
      return await FileModel.create(fileData)
    },

    deleteFile: async (name: string): Promise<boolean> => {
      if (!name) {
        throw new Error('Invalid file name')
      }
      return await FileModel.delete(name)
    },

    updateFileContent: async (name: string, content: string): Promise<File | null> => {
      if (!name) {
        throw new Error('Invalid file name')
      }

      const updatedFile = await FileModel.updateContent(name, content)
      if (!updatedFile) {
        throw new Error('File not found')
      }
      return updatedFile
    },

    renameFile: async (oldName: string, newName: string): Promise<File | null> => {
      if (!oldName || !newName) {
        throw new Error('Both old and new names are required')
      }

      const renamedFile = await FileModel.rename(oldName, newName)
      if (!renamedFile) {
        throw new Error('File not found')
      }
      return renamedFile
    }
  }
}
