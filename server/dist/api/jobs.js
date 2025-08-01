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
exports.default = default_1;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const scraper_1 = require("../logic/scraper");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
function default_1(io) {
    // GET all jobs
    router.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const jobs = yield prisma.scrapingJob.findMany({
                orderBy: {
                    created_at: 'desc',
                },
            });
            res.json(jobs);
        }
        catch (error) {
            console.error('Failed to fetch jobs:', error);
            res.status(500).json({ error: 'Failed to fetch jobs' });
        }
    }));
    // GET job stats
    router.get('/stats', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const stats = yield prisma.scrapingJob.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
            });
            const result = stats.reduce((acc, curr) => {
                acc[curr.status] = curr._count.status;
                return acc;
            }, {});
            result.total = yield prisma.scrapingJob.count();
            res.json(result);
        }
        catch (error) {
            console.error('Failed to fetch job stats:', error);
            res.status(500).json({ error: 'Failed to fetch job stats' });
        }
    }));
    // GET a single job by ID
    router.get('/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const job = yield prisma.scrapingJob.findUnique({
                where: { job_id: id },
            });
            if (job) {
                res.json(job);
            }
            else {
                res.status(404).json({ error: 'Job not found' });
            }
        }
        catch (error) {
            console.error('Failed to fetch job:', error);
            res.status(500).json({ error: 'Failed to fetch job' });
        }
    }));
    // POST a new job
    router.post('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { jobType, parameters, userId } = req.body;
            const newJob = yield prisma.scrapingJob.create({
                data: {
                    job_type: jobType,
                    parameters: parameters || {},
                    user_id: userId,
                    status: 'pending',
                },
            });
            // Start the scraping job in the background
            (0, scraper_1.startRealScrapingProcess)(newJob.job_id, newJob.job_type, newJob.parameters);
            res.status(201).json(newJob);
        }
        catch (error) {
            console.error('Failed to create job:', error);
            res.status(500).json({ error: 'Failed to create job' });
        }
    }));
    // PUT to update a job
    router.put('/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const updates = req.body;
            const updatedJob = yield prisma.scrapingJob.update({
                where: { job_id: id },
                data: updates,
            });
            io.emit('job-update', updatedJob);
            res.json(updatedJob);
        }
        catch (error) {
            console.error('Failed to update job:', error);
            res.status(500).json({ error: 'Failed to update job' });
        }
    }));
    // POST to cancel a job
    router.post('/:id/cancel', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const canceledJob = yield prisma.scrapingJob.update({
                where: { job_id: id },
                data: { status: 'failed' }, // Or 'cancelled' if you add it to the enum
            });
            res.json(canceledJob);
        }
        catch (error) {
            console.error('Failed to cancel job:', error);
            res.status(500).json({ error: 'Failed to cancel job' });
        }
    }));
    return router;
}
