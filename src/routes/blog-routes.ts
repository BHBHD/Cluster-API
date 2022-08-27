import {Router} from 'express';
import {PrismaClient} from "@prisma/client";

export const router = Router();
const prisma = new PrismaClient();

router.get('/get_blogs', async (req, res) => {
    const uid = req.query.uid;
    let pipe = (uid) ? {where: {uid: uid.toString()}} : null;
    let blogs = await prisma.cluster_project.findMany(pipe)
    return res.status(200).json(blogs);
});

router.put('/create_blog', async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const image = req.body.image;
    const uid = req.body.uid;

    console.log(req.body);

    if (!title || !content || !uid) return res.status(400).json({error: 'Missing Arguments'});

    let user = await prisma.cluster_user.findUnique({
        where: {uid: uid.toString()}
    });
    if (!user) return res.status(400).json({error: 'User not found with the given UID'});

    const created_at = new Date().toISOString();
    try {
        let blog = await prisma.cluster_project.create({
            data: {
                title: title.toString(),
                content: content.toString(),
                image: (image) ? image.toString() : null,
                uid: user.uid,
                author: user.name,
                created_at: created_at
            }
        });
        return res.status(200).json({message: 'Blog created successfully', blog: blog});
    } catch (e: any) {
        return res.status(500).json({error: e.message});
    }
});

router.post('/update_blog', async (req, res) => {
    const title = req.body.title || '';
    const content = req.body.content || '';
    const image = req.body.image || '';
    const id = req.body.id;

    if (!id) return res.status(400).json({error: 'Missing Blog Id'});

    const blog = await prisma.cluster_project.findFirst({where: {id: parseInt(id)}});
    if (!blog) return res.status(404).json({error: 'Blog Not Found'});

    try {
        let updated_blog = await prisma.cluster_project.update({
            where: {id: parseInt(id)},
            data: {
                title: (title == '') ? blog.title : title.toString(),
                content: (content == '') ? blog.content : content.toString(),
                image: (image == '') ? blog.image : image.toString()
            }
        });
        return res.status(200).json({message: 'Blog updated successfully', blog: updated_blog});
    } catch (e: any) {
        return res.status(500).json({error: e.message});
    }
});

router.delete('/delete_blog', async (req, res) => {
    const id = req.query.id;

    if (!id) return res.status(400).json({error: 'Missing Blog Id'});

    const blog = await prisma.cluster_project.findFirst({where: {id: parseInt(id.toString())}});
    if (!blog) return res.status(404).json({error: 'Blog Not Found'});

    try {
        let targetedBlog = await prisma.cluster_project.delete({where: {id: parseInt(id.toString())}});
        return res.status(200).json({message: 'Blog deleted successfully', blog: targetedBlog});
    } catch (e: any) {
        return res.status(500).json({error: e.meta.target});
    }
});
