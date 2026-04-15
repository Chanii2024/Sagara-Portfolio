# 🚀 Sagara Portfolio - Setup Guide

Welcome to the Sagara Portfolio project. Follow the instructions below to get your local environment set up and the application running.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running on default port `27017`)

## 📥 Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/Chanii2024/Sagara-Portfolio.git
   ```

2. **Navigate to the project root**:
   ```bash
   cd Sagara-Portfolio
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## 🚀 Running the App

1. **Start MongoDB**:
   Ensure your MongoDB service is active.

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Access the application**:
   - **Portfolio:** [http://localhost:3000](http://localhost:3000)
   - **Admin Panel:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

## 🔐 Admin Credentials

To manage the portfolio, use the following credentials on the admin login page:
- **Username:** `sagara`
- **Password:** `123`

## 📁 Project Features
- **Auto-Conversion:** Uploaded images are automatically optimized and converted to `.webp` format.
- **Dynamic Categories:** Images can be sorted by categories in real-time.
- **Responsive Design:** Fully optimized for mobile and desktop viewing.

---
*Note: Make sure the `uploads/` directory has write permissions.*
