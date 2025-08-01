
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all proxies
router.get('/', async (req, res) => {
    try {
        const proxies = await prisma.proxyServer.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
        res.json(proxies);
    } catch (error) {
        console.error('Failed to fetch proxies:', error);
        res.status(500).json({ error: 'Failed to fetch proxies' });
    }
});

// GET proxy stats
router.get('/stats', async (req, res) => {
    try {
        const proxies = await prisma.proxyServer.findMany();
        const stats = {
            total: proxies.length,
            active: proxies.filter(p => p.status === 'active').length,
            blocked: proxies.filter(p => p.status === 'blocked').length,
            testing: proxies.filter(p => p.status === 'testing').length,
        };
        res.json(stats);
    } catch (error) {
        console.error('Failed to fetch proxy stats:', error);
        res.status(500).json({ error: 'Failed to fetch proxy stats' });
    }
});

// POST a new proxy
router.post('/', async (req, res) => {
    try {
        const newProxy = await prisma.proxyServer.create({
            data: req.body,
        });
        res.status(201).json(newProxy);
    } catch (error) {
        console.error('Failed to add proxy:', error);
        res.status(500).json({ error: 'Failed to add proxy' });
    }
});

// PUT to update a proxy
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProxy = await prisma.proxyServer.update({
            where: { proxy_id: id },
            data: req.body,
        });
        res.json(updatedProxy);
    } catch (error) {
        console.error('Failed to update proxy:', error);
        res.status(500).json({ error: 'Failed to update proxy' });
    }
});

// DELETE a proxy
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proxyServer.delete({
            where: { proxy_id: id },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Failed to delete proxy:', error);
        res.status(500).json({ error: 'Failed to delete proxy' });
    }
});


import axios from 'axios';

// ... (rest of the file)

function parseProxyUrl(proxyUrl: string) {
    try {
        const url = new URL(proxyUrl);
        return {
            host: url.hostname,
            port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
            protocol: url.protocol.replace(':', ''),
        };
    } catch (error) {
        throw new Error(`Invalid proxy URL: ${proxyUrl}`);
    }
}

async function testProxy(proxy: { host: string; port: number; protocol: string; }) {
    try {
        const response = await axios.get('https://www.google.com', {
            proxy: {
                host: proxy.host,
                port: proxy.port,
                protocol: proxy.protocol,
            },
            timeout: 5000, // 5 seconds
        });
        return { success: response.status === 200, responseTime: response.headers['request-duration'] };
    } catch (error) {
        return { success: false, responseTime: 0 };
    }
}

// POST to test a proxy
router.post('/:id/test', async (req, res) => {
    try {
        const { id } = req.params;
        const proxy = await prisma.proxyServer.findUnique({ where: { proxy_id: id } });
        if (!proxy) {
            return res.status(404).json({ error: 'Proxy not found' });
        }

        const parsedProxy = parseProxyUrl(proxy.proxy_url);
        const result = await testProxy(parsedProxy);
        res.json(result);
    } catch (error) {
        console.error('Failed to test proxy:', error);
        res.status(500).json({ error: 'Failed to test proxy' });
    }
});

// POST to run a health check on all proxies
router.post('/health-check', async (req, res) => {
    try {
        const proxies = await prisma.proxyServer.findMany();
        let active = 0;
        let blocked = 0;

        for (const proxy of proxies) {
            const parsedProxy = parseProxyUrl(proxy.proxy_url);
            const result = await testProxy(parsedProxy);
            if (result.success) {
                active++;
                await prisma.proxyServer.update({
                    where: { proxy_id: proxy.proxy_id },
                    data: { status: 'active' },
                });
            } else {
                blocked++;
                await prisma.proxyServer.update({
                    where: { proxy_id: proxy.proxy_id },
                    data: { status: 'blocked' },
                });
            }
        }

        res.json({ summary: { total_tested: proxies.length, active, blocked } });
    } catch (error) {
        console.error('Failed to run health check:', error);
        res.status(500).json({ error: 'Failed to run health check' });
    }
});


export default router;
