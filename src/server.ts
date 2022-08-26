import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Log from "./utils/log";
import {router as blogRoutes} from './routes/blog-routes';
import {router as userRoutes} from './routes/user-routes';

export const app = express();


let routeLogger = (req, res, next) => {
    let method = req.method;

    let url = req.url;
    if (url.length > 50) url = url.slice(0, 50) + '...';

    let status = res.statusCode;

    Log.info(`${url}`.blue, `${method.padEnd(4, ' ')} |${status.toString().padStart(4, ' ')}`);
    next();
};

class API {

    constructor() {
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(routeLogger);

        app.use(`/blogs`, blogRoutes);
        app.use(`/user`, userRoutes);
        app.get(`*`, async (req, res) => {
            res.status(404)
                .json({
                    success: false,
                    message: 'Endpoint not found'
                });
        });
    }
}

const port: number = parseInt('8000');
app.listen(port, () => Log.info(`⚡ API is live on port http://127.0.0.1:${port}`.green, `ESTABLISH`));

new API();
