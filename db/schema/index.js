import { genderEnum, user } from "./user.js"
import blackListToken from "./blacklisttoken.js"
import { role } from "./role.js"
import { permission } from "./permission.js"
import { rolePermission } from "./rolePermissions.js"
import {vehicle,
    vehicleTypeEnum,
    transmissionTypeEnum,
    fuelTypeEnum,
    driverAvailabilityEnum
} from './vehicle.js'
import { vehicleReview } from "./vehicleReview.js"
import { booking, statusEnum } from "./booking.js"
import { favorite } from "./favorite.js"
import { userReview } from "./userReview.js"
import {conversation} from "./conversation.js"
import { message } from "./message.js"
import { userDevices } from "./userDevices.js"

const schema = [
    user,
    genderEnum,
    blackListToken,
    role,
    permission,
    rolePermission,
    vehicle,
    vehicleTypeEnum,
    transmissionTypeEnum,
    fuelTypeEnum,
    driverAvailabilityEnum,
    vehicleReview,
    booking,
    statusEnum,
    favorite,
    userReview,
    conversation,
    message,
    userDevices
]

export default schema