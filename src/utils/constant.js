import 'dotenv/config'

export const ROLES = {
    HOST: 'Host',
    ADMIN: 'Admin',
    RENTER: 'Renter',
};

export const PERMISSIONS = {
    GET_ALL_USERS: "get_all_users",
    MANAGE_USERS: 'manage_users',
    CREATE_VEHICLE: 'create_vehicle',
    VIEW_VEHICLES: 'view_vehicles',
    DELETE_VEHICLE: 'delete_vehicle',
    EDIT_VEHICLE: 'edit_vehicle',
    DELETE_USER: 'delete_user',
    MANAGE_PERMISSIONS: 'manage_permissions',
    MANAGE_ROLES: "manage_roles",
};

export const BASE_URL='http://192.168.1.2:4000'
  
  
export const {
    SERVER_PORT,
    SERVER_HOST,
    DATABASE_URL,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_NAME,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_NAME,
    JWT_PRIVATE_KEY,
    JWT_ACCESS_EXPIRATION_TIME,
    JWT_REFRESH_EXPIRATION_TIME

} = process.env