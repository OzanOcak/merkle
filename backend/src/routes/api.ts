import { Router } from 'express'
import fileRouter from './file.routes'
import exportRouter from './export.routes'

const router = Router()

router.use('/file', fileRouter)
router.use('/transfer', exportRouter)

export default router
