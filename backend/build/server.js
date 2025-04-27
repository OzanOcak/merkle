"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const api_1 = __importDefault(require("./routes/api"));
const database_1 = require("./database");
const app = (0, express_1.default)();
const port = 3001;
// Configure allowed origins
const ALLOWED_ORIGINS = [
    'http://localhost:5173', // Electron renderer
    'http://localhost:5174' // Optional dev frontend
    // Add 'app://*' if using custom protocol in production
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400 // Cache CORS preflight for 24h
}));
//app.use(cors())
app.use(body_parser_1.default.json());
app.use('/api', api_1.default);
(0, database_1.connectDatabase)().then(() => {
    app.listen(port, () => {
        console.log(`Markle@2025 API running at http://localhost:${port}`);
    });
});
exports.default = app;
