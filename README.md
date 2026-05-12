# StoreTrack

StoreTrack is a simple, single-user inventory management and Point of Sale (POS) system designed for small business owners who want full control over their products, sales, and profit tracking without the complexity of multi-user systems.

---

## 🚀 Overview

StoreTrack is built as a **sole proprietorship system**, meaning it is designed for a single business owner. It allows you to:

- Manage your inventory efficiently
- Record sales seamlessly
- Track profit accurately in real-time
- Generate receipts instantly
- Visualize business performance via dashboards

---

## ✨ Features

### 📦 Inventory Management

- Add and manage products with:
  - Category
  - Image upload
  - Barcode
  - Shelf number
  - Restock unit
  - Sales unit
  - Low stock threshold
  - Cost price
  - Selling price

---

### 💰 Smart Profit Calculation

- Profit is calculated **at the time of sale**
- Prevents inaccuracies when product prices change later
- Ensures reliable financial tracking

---

### 🧾 Point of Sale (POS)

- Fast and intuitive sales workflow:
  - Search products by **name** or **SKU**
  - **Barcode scanning** auto-adds items to cart

- Real-time sales summary
- Automatic receipt generation
- Printable **PDF receipts**

---

### 📊 Dashboard & Analytics

- Overview of:
  - Total sales
  - Total profit

- Visual insights with charts
- Helps track business performance at a glance
- Sales reports export (CSV/Excel)

---

## 🧰 Tech Stack

- **Frontend & Backend:** Next.js 16
- **Language:** TypeScript
- **UI Library:** Material UI (MUI)
- **Styling:** Tailwind CSS
- **State Management:** React Query
- **Database:** MongoDB (via Mongoose)
- **Form Handling:** React Hook Form + Zod
- **Charts:** Recharts
- **Barcode Scanning:** ZXing & Quagga2
- **Media Storage:** Cloudinary

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/store-track.git
cd store-track
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env.local` file and configure:

```env
MONGODB_URI=your_database_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3311
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### 4. Run development server

```bash
npm run dev
```

App will be available at:

```
http://localhost:3311
```

---

## 🏗️ Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure (Simplified)

```
/app            → Next.js App Router pages
/components     → Reusable UI components
/lib            → Utilities and helpers
/models         → Mongoose schemas
/hooks          → Custom React hooks
```

---

## 🔒 Authentication

- Uses NextAuth (beta)
- Designed for **single owner usage**
- No role-based access or multi-user system

---

## ⚠️ Limitations

- No multi-user or role-based access
- No cloud multi-tenant support
- Designed strictly for individual business use
- No payment system integration
- No extra expenses calculation

---

## 🧠 Design Philosophy

StoreTrack focuses on:

- Simplicity over complexity
- Accuracy in financial calculations
- Speed in POS operations
- Minimal setup for small businesses

---

## 📌 Future Improvements (Optional Ideas)

- Multi-user support
- Inventory alerts/notifications
- Offline-first capability
- Mobile optimization

---

## 📄 License

This project is public and intended for proprietary use.

---

## 👨‍💻 Author

Built and maintained by Hayzedd, full-stack developer focused on practical, scalable business solutions.

---
