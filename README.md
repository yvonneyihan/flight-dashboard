# Flight Dashboard

This is a full-stack web application for searching, tracking, and reviewing flights.  
It uses a **Vite + React** frontend with a **Node.js + Express + MySQL** backend,  
and **simulated flight data** stored in the database (no external API required).

## Features

- **Flight Search** – Search flights by departure, arrival, airline, and date range.
- **Popular Routes Tracking** – Records and ranks frequently searched routes.
- **User Accounts** – Registration & secure login (bcrypt + express-session).
- **Flight Reviews** – Users can leave comments and ratings for flights.
- **Autocomplete Search** – Airport search with instant suggestions.
- **Responsive Design** – Works on desktop, tablet, and mobile.

## Tech Stack

- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Session Management**: express-session
- **Environment Variables**: dotenv

## Folder Structure
````markdown
myproj/
├── server/ # Backend
│ ├── routes/
│ │ └── api/ # API routes
│ ├── db.js # Database connection pool
│ └── database/ # SQL schema & sample data
│
├── client/ # React frontend
│ └── src/
│ ├── components/ # Autocomplete, reusable UI parts
│ ├── pages/ # Dashboard, Login, Register, Map, etc.
│ ├── App.jsx # Root React component
│ └── main.jsx # React entry point
│
├── package.json
└── vite.config.js # Vite dev config
````

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yvonneyihan/flight-dashboard.git
   cd myproj

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install

3. **Database setup**
   Create a MySQL database.
   The database name is customizable. Replace flightdb with your own name everywhere (in SQL and .env)
   Run the schema and sample data:
   ```bash
   mysql -u root -p flightdb < database/schema.sql
   mysql -u root -p flightdb < database/sample_data.sql

5. **Run the app**
   ```bash
   npm run dev

6. **Open the app at http://localhost:5173**

