export interface Component {
  name: string;
  serial_number: string;
}

export interface VehicleData {
  [vin: string]: Component[];
}
