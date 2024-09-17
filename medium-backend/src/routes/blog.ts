import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify, decode } from 'hono/jwt'

import { createblog, updateblog } from "@priyanshu-hover/medium-common";
export const blogRoutes = new Hono<(
    {
        Bindings:
        {
            DATABASE_URL: string,
            JWT_SECRET: string,

        },
        Variables:
        {
            userId: string;
        }
    }
)>();

//middleware will extract the userId and passon to the route handler

blogRoutes.use('/*', async (c, next) => {

    const authHeader = c.req.header("Authorization") || "";
    const token = authHeader.split(' ')[1];
    try {
        const response = await verify(token, c.env.JWT_SECRET);

        if (response) {

            //@ts-ignore
            c.set("userId", response.id);//stores the user inside the context
            await next();
        }
        else {
            c.status(411);
            return c.json({ message: "Unauthorized Route" })
        }
    } catch (error) {
        return c.json({ message: "hello", error });
    }
})

//post new blog
blogRoutes.post('/', async (c) => {
    const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());

    const body = await c.req.json();
    const { success } = createblog.safeParse(body);
    if (!success) {
        return c.json({ message: "Wrong input Validation Failed" })
    }

    const authorId = c.get("userId")
    try {

        const response = await prisma.post.create({

            data: {
                title: body.title,
                content: body.content,
                published: true,
                authorId: authorId
            }
        })
        if (!response) {
            return c.json({ message: "Problem in Input" })
        }
        return c.json({ message: "Blog Created Successfully", response });
    }
    catch (error) {
        return c.json({ error });
    }

});
//update specific blog
blogRoutes.put('/', async (c) => {
    const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());
    const body = await c.req.json();
    const { success } = updateblog.safeParse(body);
    if (!success) {
        return c.json({ message: "Wrong input Validation Failed" })
    }
    try {

        const response = await prisma.post.update({
            where: {
                id: body.id//blogid
            },
            //@ts-ignore
            data: {
                title: body.title,
                content: body.content,
            }
        })
        if (!response) {
            return c.json({ message: "Problem in Input" })
        }
        return c.json({ response, message: "Blog Updated Successfully" });
    }
    catch (error) {
        return c.json({ error })
    }

})
//get all blogs
blogRoutes.get('/bulk', async (c) => {
    const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());

    try {
        const response = await prisma.post.findMany({
            where: {
                authorId: c.get("userId")
            }
        });
        if (!response) {
            return c.json({ message: "Problem  a in Input" })
        }

        return c.json({ response, message: "Published Blogs" });
    }
    catch (error) {
        return c.json({ error });
    }

})
//gets blog by blog id
blogRoutes.get('/:id', async (c) => {
    const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());
    const body = c.req.param("id");

    try {
        const response = await prisma.post.findFirst({
            where: {
                id: body
            }
        })
        if (!response) {
            c.status(411)
            return c.json({ message: "Problem in Input" })
        }
        return c.json({ response, message: "Blog Updated Successfully" });
    }
    catch (error) {
        return c.json({ error });
    }

})
