# ✈️ SkyHigh Airline System - MASTER GUIDE

This guide will show you exactly how to run the project and how to see your data (Users, Admins, Flights) in the database.

---

## 🚀 Part 1: How to Run the Project
You need **TWO** terminal windows open at the same time.

### 1. Start the Backend (The Brain)
- Open a terminal.
- Type: `cd server`
- Type: `npm install` (Only if first time)
- Type: `npm run dev`
- **What to look for:** If you see `✅ MongoDB Connected`, you are ready!

### 2. Start the Frontend (The Interface)
- Open a **SEPARATE** terminal window.
- Type: `cd client`
- Type: `npm install` (Only if first time)
- Type: `npm run dev`
- **What to look for:** A link like `http://localhost:5173`. Open this in Chrome.

---

## 🗄️ Part 2: How to See Your Data (MongoDB)
You can see your users and flights using **MongoDB Compass** (a visual tool).

### 1. Open MongoDB Compass
- Open the application **MongoDB Compass** on your computer.
- If you use **Local MongoDB**: Paste `mongodb://localhost:27017` and click **Connect**.
- If you use **Atlas (Cloud)**: Paste your `mongodb+srv://...` link from your `.env` file and click **Connect**.

### 2. Find the Data
- On the left side, you will see a database named **`airline-reservation`**.
- Click it to see these "Collections":
  - **`users`**: This stores everyone who registers.
  - **`flights`**: This stores the available flights.
  - **`bookings`**: This stores who booked which flight.

---

## 👨‍💼 Part 3: How to make a user an ADMIN
By default, everyone who registers is a regular "user". To see the Admin Dashboard:

1.  Register a new user on the website (e.g., `admin@test.com`).
2.  Open **MongoDB Compass**.
3.  Go to the **`users`** collection.
4.  Find your user. Look for the field **`role`**.
5.  Double-click "user" and change it to **`admin`**.
6.  Click **Update**.
7.  Now, log out and log back in on the website. You will see the **Admin Dashboard**!

---

## 🛠️ Part 4: Troubleshooting "Registration Failed"
If you see an error when registering:
1.  **Check Terminal 1**: Does it say `Error: bad auth`? 
    - **Fix**: You forgot to put your real password in `server/.env`.
2.  **Check Terminal 1**: Does it say `Could not connect... whitelisted`?
    - **Fix**: Go to MongoDB Atlas website -> Network Access -> Add IP Address -> "Allow Access from Anywhere".

---

## 📂 Key Folders for your AWD Project
- **`client/src/pages`**: Change how pages look.
- **`server/models`**: Change what data is stored.
- **`server/controllers`**: Change how the logic works (Login/Register).
