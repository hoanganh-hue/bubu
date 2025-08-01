
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// API endpoint để lấy danh sách công ty
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

        const where: any = {};

        // Áp dụng bộ lọc
        if (filters.province) {
            where.province = filters.province;
        }
        if (filters.industryCode) {
            where.industry_code = filters.industryCode;
        }
        if (filters.keyword) {
            where.OR = [
                { company_name: { contains: filters.keyword, mode: 'insensitive' } },
                { tax_code: { contains: filters.keyword, mode: 'insensitive' } }
            ];
        }
        // Thêm các bộ lọc khác tương tự...

        const total = await prisma.company.count({ where });
        const companies = await prisma.company.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                created_at: 'desc',
            },
        });

        res.json({
            companies,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

// GET a single company by tax code
router.get('/:taxCode', async (req, res) => {
    try {
        const { taxCode } = req.params;
        const company = await prisma.company.findUnique({
            where: { tax_code: taxCode },
        });
        if (company) {
            res.json(company);
        } else {
            res.status(404).json({ error: 'Company not found' });
        }
    } catch (error) {
        console.error('Failed to fetch company:', error);
        res.status(500).json({ error: 'Failed to fetch company' });
    }
});

// GET company statistics
router.get('/stats', async (req, res) => {
    try {
        const totalCompanies = await prisma.company.count();
        const companiesByProvince = await prisma.company.groupBy({
            by: ['province'],
            _count: {
                province: true,
            },
            orderBy: {
                _count: {
                    province: 'desc',
                },
            },
            take: 10,
        });
        res.json({ totalCompanies, companiesByProvince });
    } catch (error) {
        console.error('Failed to fetch company stats:', error);
        res.status(500).json({ error: 'Failed to fetch company stats' });
    }
});

// POST to export company data (placeholder)
router.post('/export', async (req, res) => {
    // In a real application, you would generate a file (CSV, Excel)
    // and return it to the client.
    res.json({ message: 'Export functionality not yet implemented.' });
});

// DELETE companies
router.delete('/', async (req, res) => {
    try {
        const { taxCodes } = req.body;
        await prisma.company.deleteMany({
            where: {
                tax_code: {
                    in: taxCodes,
                },
            },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Failed to delete companies:', error);
        res.status(500).json({ error: 'Failed to delete companies' });
    }
});

export default router;
