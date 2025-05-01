import { Router } from 'express'
import fileRouter from './file.routes'
import exportRouter from './export.routes'

const router = Router()

router.use('/file', fileRouter)
router.use('/transfer', exportRouter)

router.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

export default router
