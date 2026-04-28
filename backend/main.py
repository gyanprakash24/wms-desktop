
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncpg
from datetime import datetime, timedelta
import os
from typing import List, Dict

app = FastAPI()

# Database connection pool
DB_POOL = None

# --- Models ---
class Component(BaseModel):
    name: str
    serial_number: str

class MobileSyncRequest(BaseModel):
    data: Dict[str, List[Component]]

class ScanRequest(BaseModel):
    vin: str
    part_serial: str
    part_code: str
    stage: str

class ClaimRequest(BaseModel):
    vin: str
    part_serial_number: str
    failure_date: str
    description: str


@app.on_event("startup")
async def startup():
    global DB_POOL
    database_url = os.environ.get("DATABASE_URL")
    if database_url is None:
        raise Exception("DATABASE_URL environment variable not set")
    DB_POOL = await asyncpg.create_pool(database_url)

@app.on_event("shutdown")
async def shutdown():
    await DB_POOL.close()


@app.get("/")
async def root():
    return {"status": "Vehicle Warranty API is running"}

@app.post("/sync/mobile")
async def sync_mobile_data(req: MobileSyncRequest):
    async with DB_POOL.acquire() as conn:
        async with conn.transaction():
            for vin, components in req.data.items():
                # Check if vehicle exists, if not, create it
                vehicle_id = await conn.fetchval('SELECT id FROM vehicles WHERE vin = $1', vin)
                if not vehicle_id:
                    vehicle_id = await conn.fetchval('INSERT INTO vehicles (vin) VALUES ($1) RETURNING id', vin)

                for component in components:
                    # Get part_id from catalog
                    part_id = await conn.fetchval('SELECT id FROM parts_catalog WHERE part_code = $1', component.name)
                    if not part_id:
                        # If the part code isn't in the main catalog, we can't log it.
                        # We will skip this component but continue the sync for others.
                        print(f"Warning: Part code {component.name} not found. Skipping.")
                        continue

                    # Log the scan, preventing duplicates
                    await conn.execute('''
                        INSERT INTO assembly_log (vehicle_id, part_id, serial_number, stage)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (vehicle_id, part_id, serial_number) DO NOTHING
                    ''', vehicle_id, part_id, component.serial_number, "mobile_sync")

    return {"message": "Mobile data sync successful."}


@app.post("/production/scan")
async def scan_part(req: ScanRequest):
    async with DB_POOL.acquire() as conn:
        # Check if vehicle exists, if not, create it
        vehicle_id = await conn.fetchval('SELECT id FROM vehicles WHERE vin = $1', req.vin)
        if not vehicle_id:
            vehicle_id = await conn.fetchval('INSERT INTO vehicles (vin) VALUES ($1) RETURNING id', req.vin)

        # Get part_id from catalog
        part_id = await conn.fetchval('SELECT id FROM parts_catalog WHERE part_code = $1', req.part_code)
        if not part_id:
            raise HTTPException(status_code=404, detail=f"Part code {req.part_code} not found in catalog.")

        # Log the scan
        await conn.execute(
            'INSERT INTO assembly_log (vehicle_id, part_id, serial_number, stage) VALUES ($1, $2, $3, $4)',
            vehicle_id, part_id, req.part_serial, req.stage
        )
    return {"message": f"Part {req.part_serial} scanned for VIN {req.vin} at stage {req.stage}."}

@app.post("/vehicles/{vin}/sell")
async def sell_vehicle(vin: str):
    async with DB_POOL.acquire() as conn:
        rows_updated = await conn.execute('UPDATE vehicles SET sold_date = $1 WHERE vin = $2', datetime.utcnow(), vin)
        if rows_updated == 'UPDATE 0':
            raise HTTPException(status_code=404, detail="Vehicle not found.")
    return {"message": f"Vehicle {vin} marked as sold. Warranty is now active."}

@app.get("/vehicles/{vin}/components")
async def get_components(vin: str):
    async with DB_POOL.acquire() as conn:
        vehicle = await conn.fetchrow('SELECT id, sold_date FROM vehicles WHERE vin = $1', vin)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found.")

        query = """
            SELECT pc.part_name, al.serial_number, pc.warranty_months
            FROM assembly_log al
            JOIN parts_catalog pc ON al.part_id = pc.id
            WHERE al.vehicle_id = $1;
        """
        components = await conn.fetch(query, vehicle['id'])

        result = []
        for c in components:
            status = "Warranty Inactive (Vehicle Not Sold)"
            expires = None
            if vehicle['sold_date']:
                warranty_end_date = vehicle['sold_date'] + timedelta(days=c['warranty_months'] * 30)
                if datetime.utcnow().date() > warranty_end_date.date():
                    status = "Expired"
                else:
                    status = "Active"
                expires = warranty_end_date.strftime('%Y-%m-%d')

            result.append({
                "part_name": c['part_name'],
                "serial_number": c['serial_number'],
                "warranty_status": status,
                "warranty_expires": expires
            })
    return result

@app.post("/claims")
async def file_claim(req: ClaimRequest):
    async with DB_POOL.acquire() as conn:
        # Fetch all data in one go
        query = """
            SELECT v.sold_date, pc.warranty_months
            FROM vehicles v
            JOIN assembly_log al ON v.id = al.vehicle_id
            JOIN parts_catalog pc ON al.part_id = pc.id
            WHERE v.vin = $1 AND al.serial_number = $2;
        """
        part_info = await conn.fetchrow(query, req.vin, req.part_serial_number)

        if not part_info:
            raise HTTPException(status_code=404, detail="Vehicle or part serial not found.")
        if not part_info['sold_date']:
            raise HTTPException(status_code=400, detail="Cannot file claim for unsold vehicle.")

        # Check warranty validity
        failure_date = datetime.fromisoformat(req.failure_date).date()
        warranty_end_date = (part_info['sold_date'] + timedelta(days=part_info['warranty_months'] * 30)).date()

        if failure_date > warranty_end_date:
            raise HTTPException(status_code=400, detail="Warranty for this part has expired.")

        # Log the claim
        await conn.execute(
            'INSERT INTO warranty_claims (vin, part_serial_number, failure_date, description) VALUES ($1, $2, $3, $4)',
            req.vin, req.part_serial_number, req.failure_date, req.description
        )

    return {"message": "Claim filed successfully."}
