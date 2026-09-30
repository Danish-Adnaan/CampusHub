const { z } = require('zod');

const authSchema = z.object({
    email: z.string().min(5).max(255).email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});

const studentAuthSchema = authSchema.extend({
    email: z.string().regex(/^2\d[^@\s]*@gcet\.edu\.in$/i, {
        message: "Student email must start with a 2-digit admission year and end with @gcet.edu.in"
    })
});

const eventSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
    date: z.string().min(1, { message: "Date is required" }),
    time: z.string().min(1, { message: "Time is required" }),
    location: z.string().min(1, { message: "Location is required" }),
    imageUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional()
});

module.exports = { authSchema, studentAuthSchema, eventSchema };