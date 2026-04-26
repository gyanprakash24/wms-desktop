from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncpg

app = FastAPI()

# Database connection pool
DB_POOL = None

@app.on_event("startup")
async def startup():
    global DB_POOL
    DB_POOL = await asyncpg.create_pool('postgresql://neondb_owner:npg_uK4rBTYslMS6@ep-purple-mountain-a4sdnbx2.us-east-1.aws.neon.tech/neondb?sslmode=require')

@app.on_event("shutdown")
async def shutdown():
    await DB_POOL.close()

class ScanRequest(BaseModel):
    vin: str
    part_serial: str
    part_code: str
    stage: str

@app.post("/production/scan")
async def production_scan(request: ScanRequest):
    async with DB_POOL.acquire() as connection:
        async with connection.transaction():
            # Validate VIN
            vehicle = await connection.fetchrow("SELECT * FROM vehicles WHERE vin = $1", request.vin)
            if not vehicle:
                raise HTTPException(status_code=404, detail="VIN not found")

            # Check for existing serial number
            existing_component = await connection.fetchrow("SELECT * FROM vehicle_components WHERE serial_number = $1", request.part_serial)
            if existing_component:
                if existing_component['vin'] != request.vin:
                    raise HTTPException(status_code=409, detail="Part already assigned to another VIN.")
                else:
                    # Part already scanned for this VIN, so it's a duplicate
                    raise HTTPException(status_code=409, detail="Duplicate part scan for this VIN.")

            # UPSERT logic is implicitly handled by the check above. Now, insert.
            await connection.execute(
                "INSERT INTO vehicle_components (vin, part_code, serial_number, stage_name, scanned_at) VALUES ($1, $2, $3, $4, NOW())",
                request.vin, request.part_code, request.part_serial, request.stage
            )

            # Update vehicle status
            await connection.execute("UPDATE vehicles SET status = 'Production' WHERE vin = $1", request.vin)

    return {"message": "Scan successful"}
