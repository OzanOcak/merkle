"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/file.routes.ts
const express_1 = require("express");
const file_controller_1 = require("../controllers/file.controller");
const file_service_1 = require("../services/file.service");
const router = (0, express_1.Router)();
const fileService = (0, file_service_1.FileService)();
const fileController = (0, file_controller_1.createFileController)(fileService);
router.get('/', fileController.getAllFiles);
router.get('/:name', fileController.getFileByName);
router.post('/', fileController.createFile);
router.put('/:name/content', fileController.updateFileContent);
router.delete('/:name', fileController.deleteFile);
router.patch('/:name/rename', fileController.renameFile);
exports.default = router;
