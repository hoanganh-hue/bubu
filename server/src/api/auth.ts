
import express from 'express';
import { PrismaClient } from '@prisma/client';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.adminUser.create({
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
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.adminUser.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const payload = { id: user.user_id, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ token: `Bearer ${token}` });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json(req.user);
});

export default router;
