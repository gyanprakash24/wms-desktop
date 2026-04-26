
-- Drop existing tables to start fresh
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS sync_outbox;
DROP TABLE IF EXISTS vehicle_components;
DROP TABLE IF EXISTS parts_catalog;
DROP TABLE IF EXISTS vehicles;

-- Task 1: Relational Database Schema
-- vehicles: PK vin, model, status (Production, Inventory, Sold), warranty_start_date.
CREATE TABLE IF NOT EXISTS vehicles (
  vin TEXT PRIMARY KEY NOT NULL,
  model TEXT,
  status TEXT CHECK(status IN ('Production', 'Inventory', 'Sold')),
  warranty_start_date TEXT
);

-- parts_catalog: Master list of trackable components (Engine, Battery, ECU).
CREATE TABLE IF NOT EXISTS parts_catalog (
  part_code TEXT PRIMARY KEY NOT NULL,
  part_name TEXT NOT NULL
);

-- Example master parts
INSERT INTO parts_catalog (part_code, part_name) VALUES
('ENG', 'Engine'),
('BAT', 'Battery'),
('ECU', 'ECU');

-- vehicle_components: PK id, FK vin, FK part_code, serial_number (Unique Index), stage_name (Chassis, Powertrain, etc.), scanned_at.
CREATE TABLE IF NOT EXISTS vehicle_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vin TEXT NOT NULL,
  part_code TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  stage_name TEXT,
  scanned_at TEXT NOT NULL,
  FOREIGN KEY (vin) REFERENCES vehicles (vin),
  FOREIGN KEY (part_code) REFERENCES parts_catalog (part_code)
);

-- Ensure serial_number is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_components_serial_number ON vehicle_components (serial_number);

-- Index for faster lookups by VIN
CREATE INDEX IF NOT EXISTS idx_vehicle_components_vin ON vehicle_components (vin);
