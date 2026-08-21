-- Allow permanent product deletion without breaking historical orders.
-- order_items keeps name/sku/price snapshots; product_id becomes nullable.

-- Drop old FK (name may vary; recreate cleanly)
ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE order_items
  ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES products(id)
  ON DELETE SET NULL;

-- Ensure dependent tables cascade (idempotent)
-- product_images, wishlist_items, reviews, inventory_transactions
-- already use ON DELETE CASCADE in 001_initial_schema.
