import controllers from '../controllers/index.js';
import express from 'express';
import viteExpress from 'vite-express';

const app = express();

app.use('/api', controllers);

const server = app.listen(3000, () => {});

viteExpress.bind(app, server);

console.log('Server running at http://localhost:3000')
