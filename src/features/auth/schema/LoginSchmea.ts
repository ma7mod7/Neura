import z from "zod";

const loginSchema = z.object({
    userNameOrEmail: z.string().min(1, { message: "Username or email is required" }),
    password: z.string()
        .min(1, "Password is required")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export default loginSchema;