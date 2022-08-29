import { Router } from 'express';
import { PrismaClient } from "@prisma/client";

export const router = Router();
const prisma = new PrismaClient();

router.get('/health-check', (req, res) => res.sendStatus(200));

router.get('', async (req, res) => {
    const uid = req.query.uid;
    if (!uid) return res.status(400).json({ error: 'Missing UID' });

    let user = await prisma.cluster_user.findUnique({
        where: { uid: uid.toString() }
    });
    if (!user) return res.status(400).json({ error: 'User not found with the given UID' });
    return res.status(200).json(user);
});

router.post('', async (req, res) => {
    const uid = req.body.uid;
    const name = req.body.name;
    const email = req.body.email;
    const image = req.body.image;
    const is_admin = req.body.is_admin;
    const has_verified_email = req.body.has_verified_email;

    if (!uid || !name || !email) return res.status(400).json({ error: 'Missing Attributes' });

    let user = await prisma.cluster_user.findUnique({
        where: { uid: uid.toString() }
    });
    if (user) return res.status(400).json({ error: 'User already exists with the given UID' });
    
    try {
        user = await prisma.cluster_user.create({
            data: {
                uid: uid.toString(),
                name: (name) ? name.toString() : 'Cluster User',
                email: email.toString(),
                image: (image) ? image.toString() : null
            }
        });
        return res.status(200).json({ message: 'User created successfully', user: user });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});
