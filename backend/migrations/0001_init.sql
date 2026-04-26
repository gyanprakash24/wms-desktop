
-- Drop existing tables to start fresh
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS vehicle_components;
DROP TABLE IF EXISTS parts_catalog;
DROP TABLE IF EXISTS vehicles;

-- vehicles: PK vin, model, status (Production, Inventory, Sold), warranty_start_date.
CREATE TABLE IF NOT EXISTS vehicles (
  vin TEXT PRIMARY KEY NOT NULL,
  model TEXT,
  status TEXT CHECK(status IN ('Production', 'Inventory', 'Sold')),
  -- The warranty_start_date is the same as the sale_date.
  -- This is set when a vehicle is sold.
  warranty_start_date TEXT
);

-- parts_catalog: Master list of trackable components (Engine, Battery, ECU).
CREATE TABLE IF NOT EXISTS parts_catalog (
  part_code TEXT PRIMARY KEY NOT NULL,
  part_name TEXT NOT NULL,
  -- Warranty duration in months.
  warranty_months INTEGER
);

-- Example master parts
INSERT INTO parts_catalog (part_code, part_name, warranty_months) VALUES
('ENG', 'Engine', 36),
('BAT', 'Battery', 24),
('ECU', 'ECU', 12);

-- vehicle_components: Links parts to a specific vehicle.
CREATE TABLE IF NOT EXISTS vehicle_components (
  id SERIAL PRIMARY KEY,
  vin TEXT NOT NULL REFERENCES vehicles(vin),
  part_code TEXT NOT NULL REFERENCES parts_catalog(part_code),
  serial_number TEXT NOT NULL,
  stage_name TEXT, -- e.g., Chassis, Powertrain
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- This flag is set to true when the vehicle is sold.
  is_under_warranty BOOLEAN DEFAULT FALSE,
  UNIQUE(serial_number)
);

-- claims: For managing warranty claims.
CREATE TABLE IF NOT EXISTS claims (
    claim_id SERIAL PRIMARY KEY,
    vin TEXT NOT NULL REFERENCES vehicles(vin),
    part_serial_number TEXT NOT NULL REFERENCES vehicle_components(serial_number),
    failure_date TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending'
);
