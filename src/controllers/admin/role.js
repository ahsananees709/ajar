import { role } from "../../../db/schema/role.js";
import { successResponse, errorResponse } from "../../utils/response.handle.js";
import { database } from "../../../db/db.js";
import { eq } from "drizzle-orm";

const createRole = async (req, res) => {
    try {
        const { title } = req.body;
        const check = await database.query.role.findFirst({ where: eq(role.title, title) })
        if (check)
        {
            return errorResponse(res,"Role with this title already exist.",400)
        }
        await database.transaction(async (transaction) => {
            const data = await transaction
                .insert(role)
                .values({
                    title
                })
                .returning();

            return successResponse(
                res,
                "Role created successfully.",
                { data }
            );
        });
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
};


const getRoles = async (req, res) => {
    try {
        const data = await database.query.role.findMany({
            with: {
                rolePermissions: {
                    with: {
                        permission: true
                    }
                }
            }
        });
        return successResponse(res, "Roles fetched successfully.", data)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
};


const updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { title } = req.body;
        const check = await database.query.role.findFirst({ where: eq(role.title, title) })
        if (check && check.id === roleId) {
            return errorResponse(res, "Role name must be different from the current name.", 400);
        }
        if (check)
        {
            return errorResponse(res,"Role with this title already exist.",400)
        }
        await database.transaction(async (transaction) => {
            const data = await transaction
            .update(role)
            .set({ title})
              .where(eq(role.id, roleId))
              .returning()
            return successResponse(
                res,
                "Role updated successfully!",
                { data }
            );
        })
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
};


const deleteRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        await database.transaction(async (transaction) => {
            const data  = await transaction.delete(role)
            .where(eq(role.id, roleId))
                .returning();
                return successResponse(
                    res,
                    "Role deleted successfully!",
                    { data }
                );
        })
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
};


export {
    createRole,
    getRoles,
    updateRole,
    deleteRole
}