import { z } from 'zod'
const createRoleValidationSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z\s]+$/),
})

const updateRoleValidationSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z\s]+$/),
})

export {
    createRoleValidationSchema,
    updateRoleValidationSchema,

}