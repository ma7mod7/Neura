import z from "zod";

const signupSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userName: z.string().min(1, "Username is required").min(3, "Too short!"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    
    password: z.string()
        .min(1, "Password is required") 
        .min(6, "Password must be at least 6 characters") 
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter") 
        .regex(/[0-9]/, "Password must contain at least one number") 
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"), 
        
    confirmPassword: z.string().min(1, "Please confirm your password"),
    
    discordHandle: z.string().min(1, "Discord handle is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type SignUpFormValues = z.infer<typeof signupSchema>;

export default signupSchema;