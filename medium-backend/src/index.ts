import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { userRoutes } from './routes/user'
import { blogRoutes } from './routes/blog'
import { PrismaClient } from "@prisma/client";
const app = new Hono<
  {
    Bindings:
    {
      DATABASE_URL: string,
      JWT_SECRET: string,

    }
  }
>().basePath("/api/v1");

app.route('/user', userRoutes);
app.route('/blog', blogRoutes)



export default app;
