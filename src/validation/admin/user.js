import { z } from 'zod'

const filterUsersValidationSchema = z.object({
  userId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default("10"),
});


const getSingleUserValidationSchema = z.object({
    userId: z.string().uuid()
});

const createUserValidationSchema = z.object({
    first_name: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z\s]+$/),
    last_name: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z\s]+$/),
      email: z.string().trim().min(1).email(),
  })

const updateUserValidationSchema = z.object({
    first_name: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z\s]+$/).optional(),
    last_name: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z\s]+$/).optional(),
    email: z.string().trim().min(1).email().optional(),
    userId: z.string().uuid().optional()
  }) 

const deleteUserValidationSchema = z.object({
    userId: z.string().uuid()
});

export {
    getSingleUserValidationSchema,
    createUserValidationSchema,
    updateUserValidationSchema,
    deleteUserValidationSchema,
    filterUsersValidationSchema
}