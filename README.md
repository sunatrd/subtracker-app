# 🚀 SubTracker

**SubTracker** is a centralized web dashboard designed for small software teams to track SaaS subscriptions, software licenses, vendor contracts, and client service agreements. It helps prevent unintentional auto-renewals and ensures you never miss a client contract expiry.

## 🛠 Tech Stack (PERN)

*   **Frontend:** React (Vite) + Tailwind CSS
*   **Backend:** Node.js + Express
*   **Database:** PostgreSQL (running via Docker)
*   **Authentication:** JWT + bcrypt
*   **Scheduler:** node-cron (for daily email alerts)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
1.  **Node.js** (v18 or higher)
2.  **Docker Desktop** (Required for the database)
3.  **Git**

---

## 🚀 Getting Started (Local Development)

Follow these steps to set up the project locally on your MacBook.

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/subtracker.git
cd subtracker
```

### 2. Start the Database
We use Docker to run PostgreSQL without cluttering your system.
```bash
# Start the database container in the background
docker compose -f docker-compose.dev.yml up -d
```
*   **DB Port:** 5432
*   **Default User:** `admin`
*   **Default Password:** `password123`
*   **Database Name:** `subtracker`

### 3. Setup the Backend (Server)
Open a terminal and navigate to the server folder.
```bash
cd server
npm install

# Start the API server
npx nodemon index.js
```
*   The server will run on **http://localhost:5000**.
*   It should log: `Server running on 5000` and `DB Synced`.

### 4. Setup the Frontend (Client)
Open a **new** terminal tab (Cmd+T) and navigate to the client folder.
```bash
cd client
npm install

# Start the React Dev Server
npm run dev
```
*   The frontend will run on **http://localhost:5173**.

---

## 🔑 First Time Login

1.  Open your browser to `http://localhost:5173`.
2.  You will see the Login Screen.
3.  Click **"Create Admin Account"** (Only do this once).
4.  Enter your email and password.
5.  **Log in** with those credentials.

---

## 📂 Project Structure

```text
subtracker/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/          # Dashboard, Inventory, Login pages
│   │   ├── components/     # Reusable UI components
│   │   └── App.jsx         # Main Router
│   └── tailwind.config.js  # Styling Config
│
├── server/                 # Node.js Backend
│   ├── models/             # Sequelize Database Models (User, Contract)
│   ├── uploads/            # Storage for PDF Contracts
│   └── index.js            # Main API Logic & Cron Jobs
│
├── docker-compose.dev.yml  # Local Database Config
├── docker-compose.prod.yml # Production Server Config
└── README.md
```

---

## 📝 Features & Usage

*   **Dashboard:** View "Total Monthly Burn" and "Upcoming Renewals" at a glance.
*   **Inventory:** Add new subscriptions or contracts.
    *   **Type:** Categorize as SaaS, License, Vendor, or Client.
    *   **Direction:** Track Expenses (Payable) vs Income (Receivable).
    *   **PDF Upload:** Attach signed contracts to the record.
*   **Alerts:** The system runs a daily Cron job (at 9:00 AM) to check for expiries happening in 30, 7, or 1 days.

---

## 🚢 Deployment (DigitalOcean)

To deploy this to a $12/mo DigitalOcean Droplet:

1.  **SSH into your Droplet.**
2.  **Clone the repo.**
3.  **Run with Docker Compose (Production):**
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```
4.  **Note:** Ensure you update the `POSTGRES_PASSWORD` in `docker-compose.prod.yml` and the connection string in `server/index.js` for security before deploying.

---

## 🐞 Troubleshooting

*   **Database connection error?**
    *   Ensure Docker is running (`docker ps`).
    *   Check if port 5432 is already in use.
*   **"Module not found"?**
    *   Make sure you ran `npm install` inside **both** the `server` and `client` folders.
*   **Login redirects to nowhere?**
    *   Check the browser console for errors. Ensure the Backend is running on port 5000.