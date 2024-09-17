import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
import { hashPasswordWithSalt, verifyPasswordWithSalt } from "../assets/hash";
//@ts-ignore
import { signupinput, signininput } from '@priyanshu-hover/common-mod';
export const userRoutes = new Hono();
userRoutes.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const { success } = signupinput.safeParse(body);
    // const salt = await bcrypt.genSalt(10);
    const password = await hashPasswordWithSalt(body.password);
    try {
        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: password.hash,
                salt: password.salt
            }
        });
        const payload = {
            sub: user.id,
            role: "admin",
            exp: Math.floor(Date.now() / 1000) + 60 * 10,
        };
        const token = await sign(payload, c.env.JWT_SECRET);
        return c.json({ jwt: token, response: "Successfully registered" });
    }
    catch (error) {
        c.status(403);
        console.log(error);
        return c.json({ error, response: "Failed to register" });
    }
});
userRoutes.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const { success } = signininput.safeParse(body);
    try {
        const user = await prisma.user.findFirst({ where: { email: body.email } });
        if (!user) {
            return c.json({ message: "User Does Not Exist" });
        }
        const payload = {
            id: user.id,
        };
        const verify = await verifyPasswordWithSalt(body.password, user.salt, user.password);
        if (!verify) {
            return c.json({ response: "Wrong Credentials " });
        }
        const token = await sign(payload, c.env.JWT_SECRET);
        return c.json({ token, response: "Succesfully Logged In " });
    }
    catch (error) {
        return c.json({ error, message: "Failed log in token problem" });
    }
});
