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
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET all proxies
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proxies = yield prisma.proxyServer.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
        res.json(proxies);
    }
    catch (error) {
        console.error('Failed to fetch proxies:', error);
        res.status(500).json({ error: 'Failed to fetch proxies' });
    }
}));
// GET proxy stats
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proxies = yield prisma.proxyServer.findMany();
        const stats = {
            total: proxies.length,
            active: proxies.filter(p => p.status === 'active').length,
            blocked: proxies.filter(p => p.status === 'blocked').length,
            testing: proxies.filter(p => p.status === 'testing').length,
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Failed to fetch proxy stats:', error);
        res.status(500).json({ error: 'Failed to fetch proxy stats' });
    }
}));
// POST a new proxy
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newProxy = yield prisma.proxyServer.create({
            data: req.body,
        });
        res.status(201).json(newProxy);
    }
    catch (error) {
        console.error('Failed to add proxy:', error);
        res.status(500).json({ error: 'Failed to add proxy' });
    }
}));
// PUT to update a proxy
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedProxy = yield prisma.proxyServer.update({
            where: { proxy_id: id },
            data: req.body,
        });
        res.json(updatedProxy);
    }
    catch (error) {
        console.error('Failed to update proxy:', error);
        res.status(500).json({ error: 'Failed to update proxy' });
    }
}));
// DELETE a proxy
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.proxyServer.delete({
            where: { proxy_id: id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Failed to delete proxy:', error);
        res.status(500).json({ error: 'Failed to delete proxy' });
    }
}));
const axios_1 = __importDefault(require("axios"));
// ... (rest of the file)
function parseProxyUrl(proxyUrl) {
    try {
        const url = new URL(proxyUrl);
        return {
            host: url.hostname,
            port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
            protocol: url.protocol.replace(':', ''),
        };
    }
    catch (error) {
        throw new Error(`Invalid proxy URL: ${proxyUrl}`);
    }
}
function testProxy(proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://www.google.com', {
                proxy: {
                    host: proxy.host,
                    port: proxy.port,
                    protocol: proxy.protocol,
                },
                timeout: 5000, // 5 seconds
            });
            return { success: response.status === 200, responseTime: response.headers['request-duration'] };
        }
        catch (error) {
            return { success: false, responseTime: 0 };
        }
    });
}
// POST to test a proxy
router.post('/:id/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const proxy = yield prisma.proxyServer.findUnique({ where: { proxy_id: id } });
        if (!proxy) {
            return res.status(404).json({ error: 'Proxy not found' });
        }
        const parsedProxy = parseProxyUrl(proxy.proxy_url);
        const result = yield testProxy(parsedProxy);
        res.json(result);
    }
    catch (error) {
        console.error('Failed to test proxy:', error);
        res.status(500).json({ error: 'Failed to test proxy' });
    }
}));
// POST to run a health check on all proxies
router.post('/health-check', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proxies = yield prisma.proxyServer.findMany();
        let active = 0;
        let blocked = 0;
        for (const proxy of proxies) {
            const parsedProxy = parseProxyUrl(proxy.proxy_url);
            const result = yield testProxy(parsedProxy);
            if (result.success) {
                active++;
                yield prisma.proxyServer.update({
                    where: { proxy_id: proxy.proxy_id },
                    data: { status: 'active' },
                });
            }
            else {
                blocked++;
                yield prisma.proxyServer.update({
                    where: { proxy_id: proxy.proxy_id },
                    data: { status: 'blocked' },
                });
            }
        }
        res.json({ summary: { total_tested: proxies.length, active, blocked } });
    }
    catch (error) {
        console.error('Failed to run health check:', error);
        res.status(500).json({ error: 'Failed to run health check' });
    }
}));
exports.default = router;
