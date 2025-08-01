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
const passport_1 = __importDefault(require("../config/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, fullName, role } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield prisma.adminUser.create({
            data: {
                email,
                password: hashedPassword,
                full_name: fullName,
                role,
                is_active: true,
                user_id: '' // Add a placeholder, as the schema requires it.
            },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma.adminUser.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const payload = { id: user.user_id, email: user.email, role: user.role };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token: `Bearer ${token}` });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}));
router.get('/user', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    res.json(req.user);
});
exports.default = router;
