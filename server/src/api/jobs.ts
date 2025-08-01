
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { startRealScrapingProcess } from '../logic/scraper';

const router = express.Router();
const prisma = new PrismaClient();

export default function (io: Server) {
    // GET all jobs
    router.get('/', async (req, res) => {
        try {
            const jobs = await prisma.scrapingJob.findMany({
                orderBy: {
                    created_at: 'desc',
                },
            });
            res.json(jobs);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            res.status(500).json({ error: 'Failed to fetch jobs' });
        }
    });

    // GET job stats
    router.get('/stats', async (req, res) => {
        try {
            const stats = await prisma.scrapingJob.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
            });
            const result = stats.reduce((acc, curr) => {
                acc[curr.status] = curr._count.status;
                return acc;
            }, {} as Record<string, number>);
            result.total = await prisma.scrapingJob.count();
            res.json(result);
        } catch (error) {
            console.error('Failed to fetch job stats:', error);
            res.status(500).json({ error: 'Failed to fetch job stats' });
        }
    });

    // GET a single job by ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const job = await prisma.scrapingJob.findUnique({
                where: { job_id: id },
            });
            if (job) {
                res.json(job);
            } else {
                res.status(404).json({ error: 'Job not found' });
            }
        } catch (error) {
            console.error('Failed to fetch job:', error);
            res.status(500).json({ error: 'Failed to fetch job' });
        }
    });

    // POST a new job
    router.post('/', async (req, res) => {
        try {
            const { jobType, parameters, userId } = req.body;
            const newJob = await prisma.scrapingJob.create({
                data: {
                    job_type: jobType,
                    parameters: parameters || {},
                    user_id: userId,
                    status: 'pending',
                },
            });

            // Start the scraping job in the background
            startRealScrapingProcess(newJob.job_id, newJob.job_type, newJob.parameters);

            res.status(201).json(newJob);
        } catch (error) {
            console.error('Failed to create job:', error);
            res.status(500).json({ error: 'Failed to create job' });
        }
    });

    // PUT to update a job
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;
            const updatedJob = await prisma.scrapingJob.update({
                where: { job_id: id },
                data: updates,
            });
            io.emit('job-update', updatedJob);
            res.json(updatedJob);
        } catch (error) {
            console.error('Failed to update job:', error);
            res.status(500).json({ error: 'Failed to update job' });
        }
    });

    // POST to cancel a job
    router.post('/:id/cancel', async (req, res) => {
        try {
            const { id } = req.params;
            const canceledJob = await prisma.scrapingJob.update({
                where: { job_id: id },
                data: { status: 'failed' }, // Or 'cancelled' if you add it to the enum
            });
            res.json(canceledJob);
        } catch (error) {
            console.error('Failed to cancel job:', error);
            res.status(500).json({ error: 'Failed to cancel job' });
        }
    });

    return router;
}
