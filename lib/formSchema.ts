import z from "zod";


export const formSchemaLogin = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Minimal 6 karakter"),
})

export const formSchemaRegister = z.object({
    nama_lengkap: z.string().min(2, "Minimal 2 karakter"),
    email: z.string().email(),
    password: z.string().min(6, "Minimal 6 karakter"),    
})