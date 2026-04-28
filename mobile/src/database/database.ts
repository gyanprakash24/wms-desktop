
import * as SQLite from 'expo-sqlite';

// --- TYPE DEFINITIONS AND INTERFACES ---

/**
 * Represents the structure of a single component.
 */
export interface Component {
  name: string;
  serial_number: string;
}

/**
 * Defines the structure of the data payload for syncing with the backend.
 */
export interface SyncData {
  [vin: string]: Component[];
}

/**
 * Represents the raw row structure from our specific vehicle/component join query.
 */
interface VehicleComponentRow {
    vin: string;
    name: string | null;
    serial_number: string | null;
}

// --- DATABASE INITIALIZATION ---
// The database is opened asynchronously once, and the promise is reused throughout the app.
const dbPromise = SQLite.openDatabaseAsync('vintrace.db');


// --- EXPORTED DATABASE PUBLIC API ---

/**
 * Initializes the database. Creates tables if they do not exist.
 * The new expo-sqlite API handles this in a single atomic transaction.
 */
export const initDB = async (): Promise<void> => {
    const db = await dbPromise;
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS vehicles (id INTEGER PRIMARY KEY NOT NULL, vin TEXT NOT NULL UNIQUE, timestamp TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS components (id INTEGER PRIMARY KEY NOT NULL, vehicle_id INTEGER NOT NULL, name TEXT NOT NULL, serial_number TEXT NOT NULL, FOREIGN KEY (vehicle_id) REFERENCES vehicles (id));
    `);
};

/**
 * Adds a new vehicle record to the database.
 */
export const addVehicle = async (vin: string): Promise<void> => {
    const db = await dbPromise;
    // The new API uses runAsync for INSERT, UPDATE, or DELETE statements.
    await db.runAsync('INSERT INTO vehicles (vin, timestamp) VALUES (?, ?);', vin, new Date().toISOString());
};

/**
 * Adds a new component record, associated with a vehicle, to the database.
 */
export const addComponent = async (vehicle_id: number, name: string, serial_number: string): Promise<void> => {
    const db = await dbPromise;
    await db.runAsync('INSERT INTO components (vehicle_id, name, serial_number) VALUES (?, ?, ?);', vehicle_id, name, serial_number);
};

/**
 * Fetches all vehicle and component data from the local database.
 * @returns A Promise that resolves with the structured SyncData.
 */
export const fetchData = async (): Promise<SyncData> => {
    const db = await dbPromise;
    // The new API uses getAllAsync to get all rows from a SELECT statement.
    const rows = await db.getAllAsync<VehicleComponentRow>('SELECT v.vin, c.name, c.serial_number FROM vehicles v LEFT JOIN components c ON v.id = c.vehicle_id;');
    
    const data: SyncData = {};
    for (const row of rows) {
        if (!data[row.vin]) {
            data[row.vin] = [];
        }
        if (row.name && row.serial_number) {
            data[row.vin].push({ name: row.name, serial_number: row.serial_number });
        }
    }
    return data;
};

/**
 * Clears all vehicle and component data from the local database in a single atomic transaction.
 */
export const clearData = async (): Promise<void> => {
    const db = await dbPromise;
    // withTransactionAsync ensures that both statements succeed or fail together.
    await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM components;');
        await db.runAsync('DELETE FROM vehicles;');
    });
};
