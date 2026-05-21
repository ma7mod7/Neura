import z from "zod";

const signupSchema = z.object({
    firstName: z.string().min(1, "auth.errors.firstNameRequired"),
    lastName: z.string().min(1, "auth.errors.lastNameRequired"),
    userName: z.string().min(1, "auth.errors.usernameRequired").min(3, "auth.errors.tooShort"),
    email: z.string().min(1, "auth.errors.emailRequired").email("auth.errors.invalidEmail"),
    
    password: z.string()
        .min(1, "auth.errors.passwordRequired") 
        .min(6, "auth.errors.passwordMin") 
        .regex(/[a-z]/, "auth.errors.passwordLowercase") 
        .regex(/[A-Z]/, "auth.errors.passwordUppercase") 
        .regex(/[0-9]/, "auth.errors.passwordNumber") 
        .regex(/[^A-Za-z0-9]/, "auth.errors.passwordSpecial"), 
        
    confirmPassword: z.string().min(1, "auth.errors.confirmPasswordRequired"),
    
    discordHandle: z.string().min(1, "auth.errors.discordRequired"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "auth.errors.passwordMismatch",
    path: ["confirmPassword"],
});

export type SignUpFormValues = z.infer<typeof signupSchema>;

export default signupSchema;
