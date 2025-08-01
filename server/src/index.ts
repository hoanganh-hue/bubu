import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import passport from './config/passport';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './api/auth';
import companyRoutes from './api/companies';
import jobRoutes from './api/jobs';
import proxyRoutes from './api/proxies';
import { initializeScraper } from './logic/scraper';

import logger from './config/logger';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

const corsOptions = {
    origin: frontendURL,
};

const io = new Server(server, {
    cors: corsOptions,
});

initializeScraper(io);

app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

const PORT = process.env.PORT || 8000;

// --- Socket.IO --- 
io.on('connection', (socket) => {
    logger.info('a user connected');
    socket.on('disconnect', () => {
        logger.info('user disconnected');
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
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes(io));
app.use('/api/proxies', proxyRoutes);

server.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});