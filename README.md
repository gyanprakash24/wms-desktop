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

## 6. Getting Started

This guide will walk you through setting up and running the WMS (Warehouse Management System) project. The project is divided into three main parts: the backend server, the frontend web application, and the mobile application.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Python](https://www.python.org/)
*   [Pip](https://pip.pypa.io/en/stable/installation/)
*   [Git](https://git-scm.com/)
*   An Android emulator or a physical Android device

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone https://github.com/gyanprakash24/wms-desktop.git
cd wms-desktop
```

### 2. Backend Setup

The backend is a FastAPI server that provides the API for the frontend and mobile applications.

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install the Python dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the backend server:**

    ```bash
    uvicorn main:app --reload
    ```

    The backend server will be running at `http://127.0.0.1:8000`.

### 3. Frontend Setup

The frontend is a SolidJS application built with Vite.

1.  **Navigate to the root directory of the project.**

2.  **Install the JavaScript dependencies:**

    ```bash
    npm install
    ```

3.  **Run the frontend development server:**

    ```bash
    npm run dev
    ```

    The frontend development server will be running at `http://localhost:1420/`.

### 4. Mobile App Setup

The mobile app is built with React Native and is designed for scanning parts in the factory.

1.  **Start the React Native Metro bundler:**

    *   Navigate to the `mobile` directory.
    *   Run the command:

        ```bash
        npx react-native start
        ```

2.  **Run the app on Android:**

    *   Make sure you have an Android emulator running or a device connected.
    *   Open a new terminal and navigate to the `mobile` directory.
    *   Run the command:

        ```bash
        npx react-native run-android
        ```

### 5. Running the Full Application

To run the entire application, you will need to have all three parts running simultaneously:

1.  **Backend:** In the `backend` directory, run `uvicorn main:app --reload`.
2.  **Frontend:** In the root directory, run `npm run dev`.
3.  **Mobile:** In the `mobile` directory, run `npx react-native start` and `npx react-native run-android`.

You should now have a fully functional WMS application with the backend, frontend, and mobile components all working together.
