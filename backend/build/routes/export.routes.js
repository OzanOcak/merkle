"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../database");
const schema_1 = require("../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// Working export endpoint without type issues
router.get('/:name/export', (req, res) => {
    const { name } = req.params;
    database_1.db.select()
        .from(schema_1.files)
        .where((0, drizzle_orm_1.eq)(schema_1.files.name, name))
        .then((results) => {
        if (results.length === 0) {
            return res.status(404).send('File not found');
        }
        const file = results[0];
        res.setHeader('Content-Disposition', `attachment; filename="${name}.md"`);
        res.setHeader('Content-Type', 'text/markdown');
        return res.send(file.content);
    })
        .catch((error) => {
        console.error('Export error:', error);
        res.status(500).send('Server error');
    });
});
exports.default = router;
