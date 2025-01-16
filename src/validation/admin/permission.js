import { z } from 'zod'
const createPermissionValidationSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z\s\-_!@#$%^&*()+=.,?]+$/)
})

const updatePermissionValidationSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z\s\-_!@#$%^&*()+=.,?]+$/)
})

const assignPermissionToRoleValidationSchema = z.object({
    roleId: z.string().uuid(),
    permissionId: z.string().uuid()
});

const getPermissionsForRoleValidationSchema = z.object({
    roleId: z.string().uuid()
});

const removePermissionFromRoleValidationSchema = z.object({
    roleId: z.string().uuid(),
    permissionId: z.string().uuid()
});

export {
    createPermissionValidationSchema,
    updatePermissionValidationSchema,
    assignPermissionToRoleValidationSchema,
    getPermissionsForRoleValidationSchema,
    removePermissionFromRoleValidationSchema
}