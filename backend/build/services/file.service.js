"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
// src/services/file.service.ts
const file_model_1 = require("../models/file.model");
const FileService = () => {
    return {
        getAllFiles: async () => {
            return await file_model_1.FileModel.getAll();
        },
        getFileByName: async (name) => {
            return await file_model_1.FileModel.getByName(name);
        },
        createFile: async (fileData) => {
            if (!fileData.name) {
                throw new Error('File name is required');
            }
            return await file_model_1.FileModel.create(fileData);
        },
        deleteFile: async (name) => {
            if (!name) {
                throw new Error('Invalid file name');
            }
            return await file_model_1.FileModel.delete(name);
        },
        updateFileContent: async (name, content) => {
            if (!name) {
                throw new Error('Invalid file name');
            }
            const updatedFile = await file_model_1.FileModel.updateContent(name, content);
            if (!updatedFile) {
                throw new Error('File not found');
            }
            return updatedFile;
        },
        renameFile: async (oldName, newName) => {
            if (!oldName || !newName) {
                throw new Error('Both old and new names are required');
            }
            const renamedFile = await file_model_1.FileModel.rename(oldName, newName);
            if (!renamedFile) {
                throw new Error('File not found');
            }
            return renamedFile;
        }
    };
};
exports.FileService = FileService;
