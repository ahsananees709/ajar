import { permission } from "../../../db/schema/permission.js";
import { rolePermission } from "../../../db/schema/rolePermissions.js";
import { successResponse, errorResponse } from "../../utils/response.handle.js";
import { database } from "../../../db/db.js";
import { eq, and } from "drizzle-orm";



const createPermission = async (req, res) => {
    try {
        const { title } = req.body;
        const check = await database.query.permission.findFirst({ where: eq(permission.title, title) })
        if (check)
        {
            return errorResponse(res,"Permission with this title already exist.",400)
        }
        await database.transaction(async (transaction) => {
            const data = await transaction
                .insert(permission)
                .values({
                    title
                })
                .returning();

            return successResponse(
                res,
                "Permission created successfully.",
                { data }
            );
        });
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
};


const getPermissions = async (req, res) => {
    try {
        const data = await database.query.permission.findMany();
        return successResponse(res, "Permissions fetched successfully.", data)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
};


const updatePermission = async (req, res) => {
    try {
        const { permissionId } = req.params;
        const { title } = req.body;
        const check = await database.query.permission.findFirst({ where: eq(permission.title, title) })
        if (check && check.id === permissionId) {
            return errorResponse(res, "Permission name must be different from the current name.", 400);
        }
        if (check)
        {
            return errorResponse(res,"Permission with this title already exist.",400)
        }
        await database.transaction(async (transaction) => {
            const data = await transaction
            .update(permission)
            .set({ title})
              .where(eq(permission.id, permissionId))
              .returning()
            return successResponse(
                res,
                "Permission updated successfully!",
                { data }
            );
        })
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
};


const deletePermission = async (req, res) => {
    const { permissionId } = req.params;
    try {
        await database.transaction(async (transaction) => {
            const data  = await transaction.delete(permission)
            .where(eq(permission.id, permissionId))
                .returning();

                return successResponse(
                    res,
                    "Permission deleted successfully!",
                    { data }
                );
        })
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
};

const assignPermissionToRole = async (req, res) => {

    const { roleId, permissionId } = req.body;

    try {
        const existing = await database.query.rolePermission.findFirst({
            where: and(eq(rolePermission.role_id, roleId), eq(rolePermission.permission_id, permissionId))
        });

        if (existing) {
            return errorResponse(res, "This permission is already assigned to the role.", 400);
        }

        await database.transaction(async (transaction) => {
            const data = await transaction.insert(rolePermission).values({
                role_id: roleId,
                permission_id: permissionId,
            }).returning();

            return successResponse(res, "Permission assigned to role successfully!", { data });
        });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const getPermissionsForRole = async (req, res) => {
    const { roleId } = req.params;

    try {
        const data = await database.query.rolePermission.findMany({
            where: eq(rolePermission.role_id, roleId),
            with: {
                permission: true,
            },
        });

        return successResponse(res, "Permissions retrieved successfully!", { permissions: data });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const removePermissionFromRole = async (req, res) => {
    const { roleId, permissionId } = req.body;
    try {
        const data = await database
        .delete(rolePermission)
        .where(
        and(
            eq(rolePermission.role_id, roleId),
            eq(rolePermission.permission_id, permissionId)
        )
    )
    .returning();

        return successResponse(res, "Permission removed from role successfully!",  data );
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export {
    createPermission,
    getPermissions,
    updatePermission,
    deletePermission,
    assignPermissionToRole,
    getPermissionsForRole,
    removePermissionFromRole
}