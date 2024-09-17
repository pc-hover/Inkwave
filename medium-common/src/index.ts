import { z } from "zod"
export const signupinput = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),

})
export const signininput = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string(),

})
export const createblog = z.object({
    content: z.string(),
    title: z.string(),
    published: z.boolean()

})
export const updateblog = z.object({
    content: z.string(),
    title: z.string(),
    id: z.string()

})


// exporting types above validations
export type signupInput = z.infer<typeof signupinput>
export type signinInput = z.infer<typeof signininput>
export type createBlog = z.infer<typeof createblog>
export type updateBlog = z.infer<typeof updateblog>