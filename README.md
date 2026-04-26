# Comprehensive Specification: Automotive WMS + DMS + Assembly Tracking

## 1. Functional Scope: The Full Lifecycle
1. **Assembly (Mobile)**: Scan and link serialized parts to VIN.
2. **Inventory (Central)**: Track vehicle location from factory to dealer.
3. **Retail Sale (DMS Sync)**: Automated warranty activation upon customer delivery.
4. **Service (Desktop)**: Claim adjudication based on original "birth" data.

## 2. Updated Tech Stack
* **Factory Mobile**: React Native + SQLite (High-speed scanning).
* **Dealer Desktop**: Tauri + Preact + SQLite (Offline-first service management).
* **Central Hub**: FastAPI + PostgreSQL (Global "Birth-to-Service" records).
* **Integration**: REST Hooks for DMS sales data.

## 3. Database Schema Concept (Parent-Child)
| Table | Fields |
| :--- | :--- |
| **Vehicles** | VIN (PK), Model, Assembly_Date, Sale_Date, Status |
| **Components** | Part_Serial (PK), VIN (FK), Part_Type, Warranty_Status |
| **Claims** | Claim_ID, VIN (FK), Part_Serial (FK), Failure_Date |

## 4. Automation Logic
```python
# Pseudo-code for Warranty Activation
def activate_warranty(vin, sale_date):
    vehicle = db.query(Vehicle).filter(vin=vin)
    vehicle.warranty_start = sale_date
    vehicle.status = "ACTIVE"
    
    # Cascade activation to all sub-components
    parts = db.query(Component).filter(vin=vin)
    for part in parts:
        part.is_covered = True
    db.commit()
```

## 5. Implementation Roadmap Expansion
Week 1-2: Develop Mobile Scanning module for factory floor.

Week 3-4: Build the "Part Genealogy" schema in PostgreSQL.

Week 5-6: Create the DMS Integration API to listen for "Vehicle Sold" events.
