import {
    pgTable,
    text,
    varchar,
    integer,
    boolean,
    timestamp,
    uuid,
    numeric,
    jsonb,
    pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user.js';
import { vehicleReview } from './vehicleReview.js';
import { booking } from './booking.js';
import { favorite } from './favorite.js';

const vehicleTypeEnum = pgEnum("vehicle_type",['Cars', 'SUVs', 'Minivans', 'Box Trucks', 'Trucks', 'Vans', 'Cargo Vans']);
const transmissionTypeEnum = pgEnum("transmission_type",['Auto', 'Manual']);
const fuelTypeEnum =pgEnum("fuel_type", ['Gasoline', 'Diesel', 'Electric', 'Hybrid']);
const driverAvailabilityEnum = pgEnum("driver_availability", ['Only with driver', 'Driver available on Demand', 'Without Driver']);

const vehicle = pgTable('vehicles', {
    id: uuid('id').defaultRandom().primaryKey(),
    host_id: uuid("host_id").references(() => user.id, { onDelete: 'cascade' }),
    // Location Details
    latitude: numeric('latitude', 10, 8).notNull(),
    longitude: numeric('longitude', 11, 8).notNull(),
    full_address: text('full_address').notNull(),
    city: varchar('city', { length: 100 }).notNull().default("unknown"),
    // Car Details
    vin_number: varchar('vin_number', { length: 17 }).unique().notNull(),
    make: varchar('make', { length: 50 }).notNull(),
    model: varchar('model', { length: 50 }).notNull(),
    year: integer('year').notNull(),
    vehicle_type: vehicleTypeEnum('vehicle_type').notNull(),
    color: varchar('color', { length: 20 }).notNull(),
    reason_for_hosting: text('reason_for_hosting').notNull(),
    // Car Availability
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date').notNull(),
    // Car Specifications
    transmission_type: transmissionTypeEnum('transmission_type').notNull(),
    fuel_type: fuelTypeEnum('fuel_type').notNull(),
    mileage: integer('mileage').notNull(),
    seats: integer('seats').notNull(),
    engine_size: varchar('engine_size', { length: 10 }).notNull(),
    price: numeric('price', 10, 2).notNull().default(0.00), 
    driver_price: numeric('driver_price', 10, 2).default(0.00), 
    delivery_available: boolean('delivery_available').default(false),
    delivery_price: numeric('delivery_price', 10, 2).default(0.00),
    // Pictures (multiple)
    pictures: jsonb('pictures'),
    // Registration and License Details
    registration_number: varchar('registration_number', { length: 20 }).notNull(),
    license_plate: varchar('license_plate', { length: 20 }).unique().notNull(),
    // Availability
    is_available: boolean('is_available').default(true),
    description: text('description'),
    is_ac: boolean('is_ac').default(false),
    is_gps: boolean('is_gps').default(false),
  is_usb: boolean('is_usb').default(false),
  is_charger: boolean('is_charger').default(false),
    is_bluetooth: boolean('is_bluetooth').default(false),
  is_sunroof: boolean('is_sunroof').default(false),
    is_push_button_start:boolean('is_push_button_start').default(false),
  driver_availability: driverAvailabilityEnum('driver_availability').notNull(),
  search_term: text("search_term").default(null),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
});



export const vehicleRelations = relations(vehicle, ({ one, many }) => ({
    host: one(user, {
      fields: [vehicle.host_id], 
      references: [user.id],   
    }),
    reviews: many(vehicleReview),
    bookings: many(booking),
    favorites: many(favorite)
  }));

export {
    vehicle,
    vehicleTypeEnum,
    transmissionTypeEnum,
    fuelTypeEnum,
    driverAvailabilityEnum 
}




