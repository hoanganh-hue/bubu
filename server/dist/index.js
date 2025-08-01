"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const passport_1 = __importDefault(require("./config/passport"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./api/auth"));
const companies_1 = __importDefault(require("./api/companies"));
const jobs_1 = __importDefault(require("./api/jobs"));
const proxies_1 = __importDefault(require("./api/proxies"));
const scraper_1 = require("./logic/scraper");
const logger_1 = __importDefault(require("./config/logger"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
    origin: frontendURL,
};
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
});
(0, scraper_1.initializeScraper)(io);
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
const PORT = process.env.PORT || 8000;
// --- Socket.IO --- 
io.on('connection', (socket) => {
    logger_1.default.info('a user connected');
    socket.on('disconnect', () => {
        logger_1.default.info('user disconnected');
    });
});
// --- Health check route ---
app.get('/', (req, res) => {
    res.json({
        message: 'Enterprise Data Scraping Server',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'enterprise-scraping-backend',
        timestamp: new Date().toISOString()
    });
});
// --- API Routes ---
app.use('/api/auth', auth_1.default);
app.use('/api/companies', companies_1.default);
app.use('/api/jobs', (0, jobs_1.default)(io));
app.use('/api/proxies', proxies_1.default);
server.listen(PORT, () => {
    logger_1.default.info(`Server is running on http://localhost:${PORT}`);
});
process.on('beforeExit', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
