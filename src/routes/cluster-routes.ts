import {Router} from 'express';
import {PrismaClient} from "@prisma/client";

export const router = Router();
const prisma = new PrismaClient();

router.get('/get_blogs', async (req, res) => {

    const uid = req.headers['uid'];
    let pipe = (uid) ? {where: {uid: uid.toString()}} : null;

    let blogs = await prisma.cluster_project.findMany(pipe)
    return res.status(200).json(blogs);

});

router.put('/create_blog', async (req, res) => {
    const title = req.headers['title'];
    const content = req.headers['content'];
    const author = req.headers['author'];
    const image = req.headers['image'];
    const UID = req.headers['uid'];

    if (!title || !content || !author || !UID) {
        return res.status(400).json({
            error: 'Missing Headers'
        });
    }

    const created_at = new Date().toISOString();
    try {
        let blog = await prisma.cluster_project.create({
            data: {
                title: title.toString(),
                content: content.toString(),
                author: author.toString(),
                image: (image) ? image.toString() : null,
                uid: UID.toString(),
                created_at: created_at
            }
        });
        return res.status(200).json({'message': blog.id});

    } catch (e: any) {
        return res.status(500).json({
            error: e.message
        });
    }
});

router.post('/update_blog', async (req, res) => {
    const bid = req.headers['bid'];
    const title = req.headers['title'] || '';
    const image = req.headers['image'] || '';
    const content = req.headers['content'] || '';

    if (!bid) return res.status(400).json({error: 'Missing Blog Id'});

    // if (!title && !content) return res.status(400).json({error: 'Missing Title or Content'});

    const blog = await prisma.cluster_project.findFirst({where: {id: parseInt(bid.toString())}});
    if (!blog) return res.status(404).json({error: 'Blog Not Found'});

    try {
        let updated_blog = await prisma.cluster_project.update({
            where: {id: parseInt(bid.toString())},
            data: {
                title: (title == '') ? blog.title : title.toString(),
                content: (content == '') ? blog.content : content.toString(),
                image: (image == '') ? blog.image : image.toString()
            }
        });
        return res.status(200).json({'message': updated_blog.id});
    } catch (e: any) {
        return res.status(500).json({
            error: e.meta.target
        });
    }
});

router.delete('/delete_blog', async (req, res) => {
    const id = req.headers['id'];

    if (!id) return res.status(400).json({error: 'Missing Blog Id'});


    const blog = await prisma.cluster_project.findFirst({where: {id: parseInt(id.toString())}});
    if (!blog) return res.status(404).json({error: 'Blog Not Found'});

    try {
        let deleted_blog = await prisma.cluster_project.delete({where: {id: parseInt(id.toString())}});
        return res.status(200).json({'message': deleted_blog.id});
    } catch (e: any) {
        return res.status(500).json({
            error: e.meta.target
        });
    }
});
