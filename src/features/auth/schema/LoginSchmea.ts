import z from "zod";

const loginSchema = z.object({
    userNameOrEmail: z.string().min(1, { message: "auth.errors.usernameOrEmailRequired" }),
    password: z.string()
        .min(1, "auth.errors.passwordRequired")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export default loginSchema;
