-- ============================================================
-- Seed data: realistic categories and menu items so the site
-- looks and works like a real restaurant during development.
--
-- NOTE ON USERS: we deliberately do NOT seed user accounts here,
-- because a correctly-hashed bcrypt password can't be safely
-- hand-written into a SQL file. Instead:
--   1. Register a normal account through the website UI.
--   2. Promote it to admin with:
--        UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
-- See README.md "Creating your first admin account" for details.
-- ============================================================

USE restaurant_db;

INSERT INTO categories (name, description) VALUES
  ('Starters', 'Small plates to start the meal'),
  ('Main Course', 'Hearty main dishes'),
  ('Pizza', 'Wood-fired pizzas'),
  ('Burgers', 'Juicy grilled and crispy burgers'),
  ('Pasta', 'Classic Italian pasta dishes'),
  ('Indian', 'Traditional Indian curries and tandoor dishes'),
  ('Chinese', 'Wok-tossed Chinese favorites'),
  ('Desserts', 'Sweet endings'),
  ('Beverages', 'Drinks, mocktails and more');

INSERT INTO menu_items
  (category_id, name, description, ingredients, price, image, is_vegetarian, is_available, is_featured)
VALUES
  ((SELECT id FROM categories WHERE name='Starters'), 'Crispy Corn Fritters', 'Golden fried corn fritters with a smoky dip.', 'Sweet corn, flour, spices, herbs', 220.00, '/images/corn-fritters.jpg', 1, 1, 1),
  ((SELECT id FROM categories WHERE name='Starters'), 'Chicken Satay Skewers', 'Grilled marinated chicken skewers with peanut sauce.', 'Chicken breast, peanut, soy, lemongrass', 320.00, '/images/chicken-satay.jpg', 0, 1, 0),
  ((SELECT id FROM categories WHERE name='Main Course'), 'Grilled Salmon', 'Pan-seared salmon with lemon butter sauce and greens.', 'Salmon, butter, lemon, asparagus', 650.00, '/images/grilled-salmon.jpg', 0, 1, 1),
  ((SELECT id FROM categories WHERE name='Main Course'), 'Vegetable Risotto', 'Creamy arborio rice with seasonal vegetables and parmesan.', 'Arborio rice, vegetable stock, parmesan, herbs', 420.00, '/images/veg-risotto.jpg', 1, 1, 0),
  ((SELECT id FROM categories WHERE name='Pizza'), 'Margherita Pizza', 'Classic pizza with fresh mozzarella, basil and tomato.', 'Dough, tomato sauce, mozzarella, basil', 380.00, '/images/margherita.jpg', 1, 1, 1),
  ((SELECT id FROM categories WHERE name='Pizza'), 'Pepperoni Pizza', 'Loaded with spicy pepperoni and extra cheese.', 'Dough, tomato sauce, mozzarella, pepperoni', 450.00, '/images/pepperoni.jpg', 0, 1, 1),
  ((SELECT id FROM categories WHERE name='Burgers'), 'Classic Cheeseburger', 'Beef patty, cheddar, lettuce, tomato, house sauce.', 'Beef, cheddar, lettuce, tomato, brioche bun', 350.00, '/images/cheeseburger.jpg', 0, 1, 1),
  ((SELECT id FROM categories WHERE name='Burgers'), 'Crispy Veggie Burger', 'Crispy vegetable patty with tangy slaw.', 'Mixed vegetables, breadcrumbs, slaw, brioche bun', 300.00, '/images/veggie-burger.jpg', 1, 1, 0),
  ((SELECT id FROM categories WHERE name='Pasta'), 'Spaghetti Carbonara', 'Creamy pasta with pancetta, egg and parmesan.', 'Spaghetti, pancetta, egg, parmesan, black pepper', 390.00, '/images/carbonara.jpg', 0, 1, 0),
  ((SELECT id FROM categories WHERE name='Pasta'), 'Penne Arrabbiata', 'Spicy tomato and garlic pasta.', 'Penne, tomato, garlic, chili, basil', 340.00, '/images/arrabbiata.jpg', 1, 1, 0),
  ((SELECT id FROM categories WHERE name='Indian'), 'Butter Chicken', 'Tender chicken in a rich tomato and butter gravy.', 'Chicken, tomato, butter, cream, spices', 480.00, '/images/butter-chicken.jpg', 0, 1, 1),
  ((SELECT id FROM categories WHERE name='Indian'), 'Paneer Tikka Masala', 'Grilled paneer cubes in a spiced onion-tomato gravy.', 'Paneer, tomato, onion, spices, cream', 420.00, '/images/paneer-tikka.jpg', 1, 1, 0),
  ((SELECT id FROM categories WHERE name='Chinese'), 'Veg Hakka Noodles', 'Stir-fried noodles with fresh vegetables.', 'Noodles, cabbage, carrot, soy sauce', 300.00, '/images/hakka-noodles.jpg', 1, 1, 0),
  ((SELECT id FROM categories WHERE name='Chinese'), 'Chilli Garlic Fried Rice', 'Wok-tossed rice with chilli and garlic.', 'Rice, garlic, chilli, spring onion', 310.00, '/images/fried-rice.jpg', 1, 1, 0),
  ((SELECT id FROM categories WHERE name='Desserts'), 'Molten Chocolate Cake', 'Warm chocolate cake with a gooey molten center.', 'Dark chocolate, butter, flour, sugar', 260.00, '/images/molten-cake.jpg', 1, 1, 1),
  ((SELECT id FROM categories WHERE name='Desserts'), 'New York Cheesecake', 'Creamy baked cheesecake with a biscuit base.', 'Cream cheese, biscuit, sugar, vanilla', 280.00, '/images/cheesecake.jpg', 1, 1, 0),
  ((SELECT id FROM categories WHERE name='Beverages'), 'Fresh Lime Soda', 'Refreshing lime soda, sweet or salted.', 'Lime, soda water, sugar/salt', 120.00, '/images/lime-soda.jpg', 1, 1, 0),
  ((SELECT id FROM categories WHERE name='Beverages'), 'Mango Smoothie', 'Thick smoothie made with fresh mango.', 'Mango, yogurt, honey', 180.00, '/images/mango-smoothie.jpg', 1, 1, 1);
