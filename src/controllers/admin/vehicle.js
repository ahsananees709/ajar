import { vehicle } from "../../../db/schema/vehicle.js";
import { database } from "../../../db/db.js";
import {successResponse, errorResponse} from '../../utils/response.handle.js'
import { eq } from "drizzle-orm";


const blockVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const vehicleData = await database.query.vehicle.findFirst({
            where:eq(vehicle.id,vehicleId)
        })
  
        if (!vehicleData) {
          return errorResponse(res, "Vehicle not found", 404);
        }

      await database.transaction(async (transaction) => {
        // Toggle the `is_available` status
        const newStatus = !vehicleData.is_available;
  
        const updatedVehicle = await transaction
          .update(vehicle)
          .set({ is_available: newStatus })
          .where(eq(vehicle.id, vehicleId))
          .returning();
  
        const message = newStatus ? "Vehicle Unblocked Successfully!" : "Vehicle Blocked Successfully!";
        
        return successResponse(res, message, { updatedVehicle });
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  };
  
const deleteVehicle = async (req, res) => {
  try {
        const { vehicleId } = req.params;
        const vehicleData = await database.query.vehicle.findFirst({
            where:eq(vehicle.id,vehicleId)
        })
  
        if (!vehicleData) {
          return errorResponse(res, "Vehicle not found", 404);
    }

    await database.transaction(async (transaction) => {
      const data  = await transaction.delete(vehicle)
      .where(eq(vehicle.id, vehicleId))
          .returning();
          return successResponse(
              res,
              "Vehicle deleted successfully!",
              data
          );
  })
    
  } catch (error) {
    return errorResponse(res,error.message,500)
  }
}

export {
  blockVehicle,
  deleteVehicle
}