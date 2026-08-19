# KULU — Ethiopian Single-Seller E-Commerce

Production-ready e-commerce web app for Ethiopia. React + TypeScript + Vite + Tailwind + Supabase.

## Features

### Storefront
- Home, Shop (search / filters / sort / pagination)
- Product detail with gallery & quantity selector
- Cart (local persistence) & Checkout with Ethiopian address fields
- Cash on Delivery
- Order confirmation & tracking timeline
- Wishlist
- Customer notifications (bell + realtime + full page)
- Auth (login / register)

### Admin (`/admin`)
- Dashboard with KPIs & 14-day sales chart
- Products CRUD (create / edit / delete / stock / featured)
- Categories CRUD
- Orders management with status updates
- Inventory overview
- Customers list

### Backend (Supabase)
- PostgreSQL with strict RLS
- Secure `create_order()` RPC (server-side price & stock validation)
- Notifications on order place + status change
- Seeded categories & products

## Quick start

```bash
git clone https://github.com/Menelik2/Kulu.git
cd Kulu
npm install
```

Create `.env`:

```env
VITE_SUPABASE_URL=https://wzhnwwndwnmtvgmfdtqf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm run dev
```

Open http://localhost:5173

### Admin accounts
- `fanakulu4@gmail.com` / `KuluAdmin2026!` (change after first login)
- `kulufana4@gmail.com` (also admin)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS 4 |
| Routing | React Router 7 |
| Data | TanStack Query, React Hook Form, Zod |
| Backend | Supabase (Auth, Postgres, Storage, Realtime) |
| UI | Lucide icons, Sonner toasts |

## Project structure

```
src/
  components/   # Layout, UI, ProductCard, NotificationBell
  features/     # AuthContext, CartContext
  pages/        # Store + admin pages
  services/     # products, admin, notifications
  routes/       # ProtectedRoute, AdminRoute
  types/        # Database types
supabase/
  migrations/   # Schema, RLS, create_order
  seed.sql
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check

## License

Private — KULU Project
