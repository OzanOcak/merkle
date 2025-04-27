import { Router } from 'express'
import { db } from '../database'
import { files } from '../database/schema'
import { eq } from 'drizzle-orm'

const router = Router()

// Working export endpoint without type issues
router.get('/:name/export', (req, res) => {
  const { name } = req.params

  db.select()
    .from(files)
    .where(eq(files.name, name))
    .then((results) => {
      if (results.length === 0) {
        return res.status(404).send('File not found')
      }

      const file = results[0]
      res.setHeader('Content-Disposition', `attachment; filename="${name}.md"`)
      res.setHeader('Content-Type', 'text/markdown')
      return res.send(file.content)
    })
    .catch((error) => {
      console.error('Export error:', error)
      res.status(500).send('Server error')
    })
})

export default router
