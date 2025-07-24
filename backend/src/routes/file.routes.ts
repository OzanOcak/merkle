import { Router } from 'express'
import { createFileController } from '../controllers/file.controller'
import { FileService } from '../services/file.service'

const router = Router()
const fileService = FileService()
const fileController = createFileController(fileService)

router.get('/', fileController.getAllFiles)
router.get('/:name', fileController.getFileByName)
router.post('/', fileController.createFile)
router.put('/:name/content', fileController.updateFileContent)
router.delete('/:name', fileController.deleteFile)
router.patch('/:name/rename', fileController.renameFile)

export default router
