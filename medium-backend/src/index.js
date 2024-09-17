import { Hono } from 'hono';
import { userRoutes } from './routes/user';
import { blogRoutes } from './routes/blog';
const app = new Hono().basePath("/api/v1");
app.route('/user', userRoutes);
app.route('/blog', blogRoutes);
export default app;
