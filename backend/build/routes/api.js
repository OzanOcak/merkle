"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const file_routes_1 = __importDefault(require("./file.routes"));
const export_routes_1 = __importDefault(require("./export.routes"));
const router = (0, express_1.Router)();
router.use('/file', file_routes_1.default);
router.use('/transfer', export_routes_1.default);
router.get('/healthcheck', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
