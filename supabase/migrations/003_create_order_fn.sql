-- Secure server-side order creation
-- Prevents price/stock manipulation from client

CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_items JSONB,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_delivery_region TEXT,
  p_delivery_city TEXT,
  p_delivery_sub_city TEXT DEFAULT NULL,
  p_delivery_woreda TEXT DEFAULT NULL,
  p_delivery_kebele TEXT DEFAULT NULL,
  p_delivery_house_info TEXT DEFAULT NULL,
  p_delivery_instructions TEXT DEFAULT NULL,
  p_payment_method payment_method DEFAULT 'cod'
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC(12, 2) := 0;
  v_delivery_fee NUMERIC(12, 2) := 0;
  v_total NUMERIC(12, 2);
  v_item JSONB;
  v_product RECORD;
  v_unit_price NUMERIC(12, 2);
  v_item_total NUMERIC(12, 2);
  v_image_url TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND is_active = true) THEN
    RAISE EXCEPTION 'Invalid or inactive user';
  END IF;

  SELECT fee INTO v_delivery_fee
  FROM delivery_configs
  WHERE is_active = true
    AND region = p_delivery_region
    AND (city IS NULL OR city = p_delivery_city)
  ORDER BY city NULLS LAST
  LIMIT 1;

  IF v_delivery_fee IS NULL THEN
    v_delivery_fee := 150;
  END IF;

  v_order_number := generate_order_number();
  INSERT INTO orders (
    order_number, user_id, status, payment_method, payment_status,
    subtotal, delivery_fee, discount_amount, total,
    delivery_region, delivery_city, delivery_sub_city, delivery_woreda,
    delivery_kebele, delivery_house_info, delivery_instructions,
    customer_name, customer_phone, customer_email
  ) VALUES (
    v_order_number, p_user_id, 'pending', p_payment_method, 'pending',
    0, v_delivery_fee, 0, 0,
    p_delivery_region, p_delivery_city, p_delivery_sub_city, p_delivery_woreda,
    p_delivery_kebele, p_delivery_house_info, p_delivery_instructions,
    p_customer_name, p_customer_phone, p_customer_email
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found or inactive: %', v_item->>'product_id';
    END IF;

    IF v_product.stock_quantity < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for product % (available: %, requested: %)',
        v_product.name, v_product.stock_quantity, (v_item->>'quantity')::INTEGER;
    END IF;

    v_unit_price := COALESCE(v_product.discount_price, v_product.price);
    v_item_total := v_unit_price * (v_item->>'quantity')::INTEGER;
    v_subtotal := v_subtotal + v_item_total;

    SELECT url INTO v_image_url
    FROM product_images
    WHERE product_id = v_product.id
    ORDER BY is_primary DESC, sort_order ASC
    LIMIT 1;

    INSERT INTO order_items (
      order_id, product_id, product_name, product_sku, product_image_url,
      unit_price, quantity, total_price
    ) VALUES (
      v_order_id, v_product.id, v_product.name, v_product.sku, v_image_url,
      v_unit_price, (v_item->>'quantity')::INTEGER, v_item_total
    );

    UPDATE products
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER,
        sold_count = sold_count + (v_item->>'quantity')::INTEGER
    WHERE id = v_product.id;

    INSERT INTO inventory_transactions (product_id, quantity_change, reason, reference_id, performed_by)
    VALUES (v_product.id, - (v_item->>'quantity')::INTEGER, 'order', v_order_id, p_user_id);
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;

  UPDATE orders SET subtotal = v_subtotal, total = v_total WHERE id = v_order_id;

  INSERT INTO notifications (user_id, title, message, type, link)
  SELECT id, 'New Order', 'Order ' || v_order_number || ' received', 'order', '/admin/orders/' || v_order_id
  FROM profiles WHERE role = 'admin';

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
