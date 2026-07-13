PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS seats;

CREATE TABLE seats (
    seat_id INTEGER PRIMARY KEY,
    table_name TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    UNIQUE (table_name, seat_number)
);

CREATE TABLE guests (
    guest_id INTEGER PRIMARY KEY,
    guest_name TEXT NOT NULL,
    city TEXT NOT NULL,
    dietary_preference TEXT NOT NULL,
    seat_id INTEGER NOT NULL,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id)
);

CREATE TABLE dishes (
    dish_id INTEGER PRIMARY KEY,
    dish_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    vegetarian INTEGER NOT NULL CHECK (vegetarian IN (0, 1))
);

CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    guest_id INTEGER NOT NULL,
    dish_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    ordered_at TEXT NOT NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(guest_id),
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
);
