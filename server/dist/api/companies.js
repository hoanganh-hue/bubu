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
// API endpoint để lấy danh sách công ty
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
        const where = {};
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
        const total = yield prisma.company.count({ where });
        const companies = yield prisma.company.findMany({
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
    }
    catch (error) {
        console.error('Failed to fetch companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
}));
// GET a single company by tax code
router.get('/:taxCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taxCode } = req.params;
        const company = yield prisma.company.findUnique({
            where: { tax_code: taxCode },
        });
        if (company) {
            res.json(company);
        }
        else {
            res.status(404).json({ error: 'Company not found' });
        }
    }
    catch (error) {
        console.error('Failed to fetch company:', error);
        res.status(500).json({ error: 'Failed to fetch company' });
    }
}));
// GET company statistics
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalCompanies = yield prisma.company.count();
        const companiesByProvince = yield prisma.company.groupBy({
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
    }
    catch (error) {
        console.error('Failed to fetch company stats:', error);
        res.status(500).json({ error: 'Failed to fetch company stats' });
    }
}));
// POST to export company data (placeholder)
router.post('/export', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // In a real application, you would generate a file (CSV, Excel)
    // and return it to the client.
    res.json({ message: 'Export functionality not yet implemented.' });
}));
// DELETE companies
router.delete('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taxCodes } = req.body;
        yield prisma.company.deleteMany({
            where: {
                tax_code: {
                    in: taxCodes,
                },
            },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Failed to delete companies:', error);
        res.status(500).json({ error: 'Failed to delete companies' });
    }
}));
exports.default = router;
