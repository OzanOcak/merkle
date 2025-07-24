import { Request, Response } from 'express'
import { FileService } from '../services/file.service'
import { NewFile } from '../database/schema'

export const createFileController = (
  fileService: ReturnType<typeof FileService>
): {
  getAllFiles: (req: Request, res: Response) => Promise<void>
  getFileByName: (req: Request<{ name: string }>, res: Response) => Promise<void>
  createFile: (req: Request<object, object, NewFile>, res: Response) => Promise<void>
  updateFileContent: (
    req: Request<{ name: string }, object, { content: string }>,
    res: Response
  ) => Promise<void>
  deleteFile: (req: Request<{ name: string }>, res: Response) => Promise<void>
  renameFile: (
    req: Request<{ name: string }, object, { newName: string }>,
    res: Response
  ) => Promise<void>
} => {
  const getAllFiles = async (_req: Request, res: Response): Promise<void> => {
    try {
      const files = await fileService.getAllFiles()
      res.json(files)
    } catch (error) {
      res.status(500).json({
        error: `Failed to fetch files: ${error instanceof Error ? error.message : String(error)}`
      })
    }
  }

  const getFileByName = async (req: Request<{ name: string }>, res: Response): Promise<void> => {
    try {
      const { name } = req.params
      const file = await fileService.getFileByName(name)
      if (!file) {
        res.status(404).json({ error: 'File not found' })
        return
      }
      res.json(file)
    } catch (error) {
      res.status(500).json({
        error: `Failed to fetch file: ${error instanceof Error ? error.message : String(error)}`
      })
    }
  }

  const createFile = async (
    req: Request<object, object, NewFile>,
    res: Response
  ): Promise<void> => {
    try {
      const newFile = await fileService.createFile(req.body)
      res.status(201).json(newFile)
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create file'
      })
    }
  }

  const updateFileContent = async (
    req: Request<{ name: string }, object, { content: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { name } = req.params
      const { content } = req.body
      const updatedFile = await fileService.updateFileContent(name, content)
      if (!updatedFile) {
        res.status(404).json({ error: 'File not found' })
        return
      }
      res.json(updatedFile)
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to update file content'
      })
    }
  }

  const deleteFile = async (req: Request<{ name: string }>, res: Response): Promise<void> => {
    try {
      const { name } = req.params
      const success = await fileService.deleteFile(name)
      if (!success) {
        res.status(404).json({ error: 'File not found' })
        return
      }
      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete file'
      })
    }
  }

  const renameFile = async (
    req: Request<{ name: string }, object, { newName: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { name } = req.params
      const { newName } = req.body
      const renamedFile = await fileService.renameFile(name, newName)
      if (!renamedFile) {
        res.status(404).json({ error: 'File not found' })
        return
      }
      res.json(renamedFile)
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to rename file'
      })
    }
  }

  return {
    getAllFiles,
    getFileByName,
    createFile,
    updateFileContent,
    deleteFile,
    renameFile
  }
}

export type FileController = ReturnType<typeof createFileController>
