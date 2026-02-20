# Stock Tracking & POS System - Implementation Plan

## 📋 Project Overview
A complete Next.js v16 + Tailwind v4 + MongoDB stock tracking and POS system optimized for market use with caching for glitchy networks.

---

## 🎯 Core Features to Build

### 1. **Authentication System**
- Simple single-user login (email/password)
- Session-based auth with cookies
- Protected routes middleware

### 2. **Database Schema (MongoDB)**
```
- Users (id, email, password_hash, name, created_at)
- Categories (id, name, color, created_at)
- Products (id, name, category_id, sku, price, cost, quantity, image, min_stock, shelf_no, unit_config, created_at)
  - shelf_no: string (optional shelf location)
  - unit_config: {
      sale_unit: string (e.g., "piece", "pack", "kg")
      restock_unit: string (e.g., "box", "dozen", "crate")
      units_per_restock: number (how many sale units per restock unit)
    }
- Sales (id, total_amount, payment_method='cash', status, created_at)
- SaleItems (id, sale_id, product_id, quantity, price, subtotal)
- StockHistory (id, product_id, change_type, quantity_change, previous_qty, new_qty, notes, created_at)
```

### 3. **Pages/Routes**
```
/ - Login page
/dashboard - Main dashboard with overview
/pos - Point of sale/checkout (main page)
/inventory - Product inventory management
/inventory/add - Add new product
/inventory/[id] - Edit product
/categories - Category management
/sales - Sales history
/sales/report - Sales reports with date filter
/settings - App settings
```

### 4. **UI Components**
- Layout (sidebar navigation, header)
- ProductCard (display in POS)
- CategoryTabs (filter products)
- Cart (checkout flow)
- DataTable (inventory, sales)
- Modal/Dialogs (confirmations, forms)
- Charts (sales visualization)

### 5. **Key Functionalities**
- **POS**: Quick product search, category filter, cart management, checkout
- **Inventory**: Real-time stock tracking, low stock alerts
- **Stock Management**: Restock items, track stock history
- **Sales**: Record sales, soft copy receipts, sales history
- **Reports**: Daily/weekly/monthly sales, top products, profit margins
- **Caching**: React Query for data caching, optimistic updates

---

## 🛠️ Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + CSS Variables
- **Database**: MongoDB with Mongoose
- **UI Components**: Material UI (MUI)
- **Auth**: NextAuth.js v5 or custom session-based auth
- **Caching**: TanStack Query (React Query)
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form + Zod validation

---

## 📦 Dependencies to Install

### Core Dependencies
```
npm install mongoose next-auth@beta bcryptjs zod react-hook-form @tanstack/react-query
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install recharts date-fns lucide-react clsx tailwind-merge
npm install @tanstack/react-query-devtools cloudinary
```

### Development Dependencies
```
npm install -D @types/bcryptjs
```

---

## 🎨 Theme Configuration (Blue & Black)
- Primary: Blue (#1E40AF)
- Secondary: Dark Blue (#1E3A8A)
- Background: White/Light Gray
- Text: Dark gray/Black
- Accents: Light blue for highlights

---

## 📁 File Structure

```
store-track/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── products/       # Product CRUD
│   │   ├── categories/     # Category CRUD
│   │   ├── sales/          # Sales endpoints
│   │   └── stock/          # Stock management
│   ├── dashboard/          # Dashboard page
│   ├── pos/                # POS/Checkout page
│   ├── inventory/          # Inventory pages
│   ├── sales/              # Sales pages
│   ├── settings/           # Settings page
│   ├── layout.tsx          # Root layout
│   ├── providers.tsx       # Context providers (Query, Auth)
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Layout components
│   ├── pos/                # POS components
│   └── inventory/          # Inventory components
├── lib/
│   ├── mongodb.ts          # MongoDB connection
│   ├── auth.ts             # Auth utilities
│   └── utils.ts            # Helper functions
├── types/
│   └── index.ts            # TypeScript types
├── .env.local              # Environment variables
└── middleware.ts          # Route protection
```

---

## 🚀 Implementation Steps

### Phase 1: Setup & Configuration
1. Install all dependencies
2. Configure MongoDB connection
3. Setup Tailwind v4 theme
4. Create TypeScript types
5. Create utility functions

### Phase 2: Authentication
1. Create login page
2. Setup NextAuth with credentials provider
3. Create auth API routes
4. Implement middleware for protected routes

### Phase 3: Database Models
1. Create User model
2. Create Category model
3. Create Product model
4. Create Sale model
5. Create SaleItem model
6. Create StockHistory model

### Phase 4: Core Features - Inventory
1. Category management (CRUD)
2. Product management (CRUD)
3. Stock tracking with history
4. Low stock alerts

### Phase 5: Core Features - POS
1. Product listing with categories
2. Search functionality
3. Cart management
4. Checkout process
5. Soft copy receipt

### Phase 6: Core Features - Sales
1. Sales history
2. Sales details view
3. Sales reports with date filter
4. Charts and analytics

### Phase 7: Dashboard
1. Overview stats
2. Quick actions
3. Recent activity

### Phase 8: Polish & Optimization
1. Error handling
2. Loading states
3. Caching optimization
4. Mobile responsiveness
5. Performance tuning

---

## 📝 Key Design Decisions

1. **Single User**: Simplified auth (no multi-user complexity)
2. **Cash Only**: No payment gateway integration for now
3. **Visual Receipt**: HTML-based printable receipts
4. **Caching First**: Aggressive caching with React Query
5. **Category Optional**: Products default to "all" category
6. **Blue/Black Theme**: Clean, professional look
7. **Offline-Friendly**: Local caching for network resilience

---

## ✅ Success Criteria
- [ ] Login/logout works
- [ ] Products can be added/edited/deleted
- [ ] Categories can be managed
- [ ] POS checkout completes successfully
- [ ] Sales are recorded with items
- [ ] Stock updates automatically on sale
- [ ] Reports generate correctly
- [ ] System works with caching in poor network
- [ ] UI is simple enough for any aged market person

---

*Plan created for user approval before implementation begins.*

