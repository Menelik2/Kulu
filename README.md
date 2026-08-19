# KULU — Ethiopian E-Commerce Platform

**Shop Smart. Delivered Across Ethiopia.**

Production-ready single-seller e-commerce web application built for the Ethiopian market.

## Features

- **Customer Storefront**: Browse, search, filter, cart, wishlist, reviews
- **Ethiopian Checkout**: Region / City / Sub-city / Woreda / Kebele address model + Cash on Delivery
- **Secure Orders**: Server-side price & stock validation, inventory protection, order lifecycle
- **Admin Dashboard**: Products, categories, inventory, orders, customers, reviews, analytics
- **Security**: Full Row Level Security (RLS), role-based access, no client-side trust of prices/stock
- **Mobile-first**: Responsive design optimized for Ethiopian mobile users

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| State / Data | TanStack Query, React Hook Form + Zod |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Deployment | Vercel + Supabase |

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Menelik2/Kulu.git
cd Kulu
npm install
```

### 2. Supabase Setup

1. Create a project at supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
3. Optionally run `supabase/seed.sql`
4. Create Storage buckets: product-images, category-images, avatars
5. Promote your user to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Environment

```bash
cp .env.example .env
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 4. Run

```bash
npm run dev
```

## Project Structure

See `/src` for components, features, pages, services, and types.
See `/supabase` for complete schema + RLS + secure order function.

## License

Private — All rights reserved.
