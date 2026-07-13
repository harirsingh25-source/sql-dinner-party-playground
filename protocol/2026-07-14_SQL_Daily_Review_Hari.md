# 🍽️ SQL Dinner-Party Mystery

**Date:** 14 July 2026<br>
**Duration:** approximately 30 minutes<br>
**Format:** interactive Zoom daily review<br>
**SQL setup:** runs entirely in your browser—no database credentials or local installation required

---

## Start here

### Open the browser SQL playground

➡️ **[Launch the Dinner-Party SQL Playground](https://neuefische.github.io/ds-matcha-transformers-220626-daily-review/)**

Keep this protocol open in one browser tab and the playground open in another.

### How to participate

During the review, you will be asked to:

- use Zoom reactions to vote
- predict query results before running them
- execute SQL in the browser
- compare results with a partner
- reveal hints only when needed
- solve a final database mystery

| Reaction | Meaning |
|---|---|
| 👍 | I agree |
| 👎 | I disagree |
| ✋ | I have a question |
| 🎉 | My query worked |
| 🤔 | I need a hint |

---

## The story

Twenty guests are attending a dinner party.

The organiser recorded information in four tables:

- `guests`
- `seats`
- `dishes`
- `orders`

Something unusual happened during dinner.

By the end of the session, you will combine the tables to answer:

> **Who placed the mystery order, what did they order, and where were they sitting?**

---

# 1. What are databases and SQL?

A **database** is an organised system for storing and retrieving information.

In extremely simple language:

> A database stores facts. SQL asks questions about those facts.

In technical language:

> A relational database stores structured records in related tables. SQL—Structured Query Language—is used to retrieve, filter, combine, aggregate and order those records.

### Vote

Which statement best describes SQL?

1. A spreadsheet application
2. A language for communicating with relational databases
3. A Python library
4. A database server

<details>
<summary>Reveal</summary>

**Answer: 2.**

SQL is a language. PostgreSQL, SQLite and MySQL are database-management systems that understand SQL.

</details>

---

# 2. Tables, rows, columns and cells

Think of a table as a structured grid.

| Database concept | Meaning |
|---|---|
| Table | A collection of related records |
| Row | One record or observation |
| Column | One attribute or variable |
| Cell | One value at the intersection of a row and column |

Example:

| guest_id | guest_name | city |
|---:|---|---|
| 1 | Ada | Berlin |
| 2 | Linus | Hamburg |

- The table contains guest records.
- Each row represents one guest.
- `city` is a column.
- `Berlin` is a cell value.

### Prediction

How many rows should the following query return?

```sql
SELECT *
FROM guests;
```

Do not run it yet. Vote first, then test your prediction in the playground.

---

# 3. Structured, semi-structured and unstructured data

| Data type | Example | Typical form |
|---|---|---|
| Structured | dinner orders | relational tables |
| Semi-structured | restaurant API response | JSON or XML |
| Unstructured | dinner-party photograph | image, video or free text |

Relational SQL databases are especially effective for **structured data** with defined columns, data types and relationships.

---

# 4. Schemas

A **schema** describes how database objects are organised.

It can define:

- table names
- column names
- data types
- keys
- relationships
- constraints

Our fictional database uses this structure:

```text
guests
  guest_id
  guest_name
  city
  dietary_preference
  seat_id

seats
  seat_id
  table_name
  seat_number

dishes
  dish_id
  dish_name
  category
  price
  vegetarian

orders
  order_id
  guest_id
  dish_id
  quantity
  ordered_at
```

---

# 5. Primary and foreign keys

A **primary key** uniquely identifies one row in a table.

Examples:

- `guests.guest_id`
- `dishes.dish_id`
- `orders.order_id`

A **foreign key** stores a reference to a row in another table.

Examples:

- `guests.seat_id` refers to `seats.seat_id`
- `orders.guest_id` refers to `guests.guest_id`
- `orders.dish_id` refers to `dishes.dish_id`

### Vote

Can two guests have the same `guest_id`?

<details>
<summary>Reveal</summary>

No. A primary-key value must uniquely identify one row.

</details>

---

# 6. Relationships

The dinner-party tables have these relationships:

```text
seats  1 ─────── many  guests
guests 1 ─────── many  orders
dishes 1 ─────── many  orders
```

One guest may place several orders.

One dish may appear in several orders.

The `orders` table connects guests to dishes.

---

# 7. SELECT and FROM

`SELECT` chooses the columns to return.

`FROM` identifies the source table.

```sql
SELECT guest_name, city
FROM guests;
```

### Challenge 1 — inspect the guest list

Write a query that returns:

- `guest_name`
- `dietary_preference`

from the `guests` table.

<details>
<summary>Hint</summary>

Start with:

```sql
SELECT
```

Then list the two column names separated by a comma.

</details>

<details>
<summary>Reveal</summary>

```sql
SELECT
    guest_name,
    dietary_preference
FROM guests;
```

</details>

---

# 8. WHERE and logical conditions

`WHERE` filters individual rows.

```sql
SELECT guest_name, city
FROM guests
WHERE city = 'Berlin';
```

Conditions can be combined:

```sql
SELECT guest_name, city, dietary_preference
FROM guests
WHERE city = 'Berlin'
  AND dietary_preference = 'vegetarian';
```

### Challenge 2 — find suitable dishes

Return all dishes that:

- are vegetarian
- cost less than 15

<details>
<summary>Hint</summary>

Use two conditions joined with `AND`.

SQLite represents true as `1` in this dataset.

</details>

<details>
<summary>Reveal</summary>

```sql
SELECT
    dish_name,
    price
FROM dishes
WHERE vegetarian = 1
  AND price < 15;
```

</details>

---

# 9. INNER JOIN

Related information is often stored in separate tables.

`INNER JOIN` combines rows that have matching key values in both tables.

```sql
SELECT
    g.guest_name,
    s.table_name,
    s.seat_number
FROM guests AS g
INNER JOIN seats AS s
    ON g.seat_id = s.seat_id;
```

Read this as:

> Start with `guests`. Bring in matching rows from `seats` where the seat IDs are equal.

### Prediction

What happens to a guest whose `seat_id` has no matching row in `seats`?

1. The guest appears with a blank seat
2. The guest is excluded
3. SQL creates a new seat
4. The query always fails

<details>
<summary>Reveal</summary>

**Answer: 2.**

An `INNER JOIN` retains only rows that match on both sides.

</details>

---

# 10. Aggregate functions

Aggregate functions summarise multiple rows.

| Function | Result |
|---|---|
| `COUNT(*)` | number of rows |
| `SUM(column)` | total |
| `AVG(column)` | mean |
| `MIN(column)` | smallest value |
| `MAX(column)` | largest value |

Example:

```sql
SELECT COUNT(*) AS total_orders
FROM orders;
```

### Challenge 3 — count ordered portions

Calculate the total number of portions ordered.

<details>
<summary>Hint</summary>

Each order has a `quantity`. Add the quantities rather than merely counting rows.

</details>

<details>
<summary>Reveal</summary>

```sql
SELECT SUM(quantity) AS total_portions
FROM orders;
```

</details>

---

# 11. GROUP BY and HAVING

`GROUP BY` creates groups before an aggregate is calculated.

```sql
SELECT
    dish_id,
    SUM(quantity) AS portions_ordered
FROM orders
GROUP BY dish_id;
```

`HAVING` filters grouped results.

```sql
SELECT
    dish_id,
    SUM(quantity) AS portions_ordered
FROM orders
GROUP BY dish_id
HAVING SUM(quantity) > 2;
```

Remember:

- `WHERE` filters individual rows before grouping
- `HAVING` filters groups after aggregation

### Challenge 4 — popular dishes

Return each dish name and its total ordered quantity.

Show only dishes with at least two ordered portions.

<details>
<summary>Hint 1</summary>

Join `orders` to `dishes` using `dish_id`.

</details>

<details>
<summary>Hint 2</summary>

Group by the dish name and filter the grouped total with `HAVING`.

</details>

<details>
<summary>Reveal</summary>

```sql
SELECT
    d.dish_name,
    SUM(o.quantity) AS portions_ordered
FROM orders AS o
INNER JOIN dishes AS d
    ON o.dish_id = d.dish_id
GROUP BY d.dish_name
HAVING SUM(o.quantity) >= 2;
```

</details>

---

# 12. ORDER BY and LIMIT

Database results have no guaranteed order unless you request one.

```sql
SELECT
    dish_name,
    price
FROM dishes
ORDER BY price DESC;
```

`LIMIT` restricts the number of returned rows.

```sql
SELECT
    dish_name,
    price
FROM dishes
ORDER BY price DESC
LIMIT 3;
```

### Prediction

Which clause must come first in the written query?

1. `LIMIT`
2. `ORDER BY`

<details>
<summary>Reveal</summary>

**Answer: 2 — `ORDER BY`.**

First sort the result, then retain the requested number of rows.

</details>

---

# 13. SQL written order versus logical processing order

SQL clauses must be written in this order:

```text
SELECT
FROM and JOIN
WHERE
GROUP BY
HAVING
ORDER BY
LIMIT
```

The database processes them in a different logical order:

```text
FROM and JOIN
WHERE
GROUP BY
HAVING
SELECT
ORDER BY
LIMIT
```

This matters because SQL must first find and combine the source rows before it can produce the final selected columns.

### Quick ordering challenge

Put these clauses into valid written order:

```text
HAVING
FROM
LIMIT
SELECT
GROUP BY
WHERE
ORDER BY
```

<details>
<summary>Reveal</summary>

```text
SELECT
FROM
WHERE
GROUP BY
HAVING
ORDER BY
LIMIT
```

</details>

---

# 14. Final guided mystery

The host discovered that a special order was placed:

- the dish was a **main**
- it was vegetarian
- it cost more than 18
- exactly two portions were ordered

Your task is to identify:

- the guest
- the dish
- the table
- the seat number
- the ordered quantity

You will need all four tables:

```text
orders
guests
dishes
seats
```

### Suggested result columns

```text
guest_name
dish_name
table_name
seat_number
quantity
```

<details>
<summary>Hint 1 — begin with the event table</summary>

Start with `orders`, because each mystery event is an order.

```sql
FROM orders AS o
```

</details>

<details>
<summary>Hint 2 — plan the join path</summary>

```text
orders → guests → seats
orders → dishes
```

</details>

<details>
<summary>Hint 3 — identify the filtering columns</summary>

The conditions use columns from both `dishes` and `orders`:

```text
category
vegetarian
price
quantity
```

</details>

<details>
<summary>Reveal the complete query</summary>

```sql
SELECT
    g.guest_name,
    d.dish_name,
    s.table_name,
    s.seat_number,
    o.quantity
FROM orders AS o
INNER JOIN guests AS g
    ON o.guest_id = g.guest_id
INNER JOIN dishes AS d
    ON o.dish_id = d.dish_id
INNER JOIN seats AS s
    ON g.seat_id = s.seat_id
WHERE d.category = 'main'
  AND d.vegetarian = 1
  AND d.price > 18
  AND o.quantity = 2;
```

Run this query in the playground to reveal the dinner-party mystery.

</details>

---

## Finished early?

Extend the final query:

1. Add the guest city.
2. Sort by dish price from highest to lowest.
3. Calculate the total cost as `price * quantity`.
4. Rename the calculated column `order_total`.
5. Return only the most expensive matching order.

---

## Core SQL reminder

```sql
SELECT
    columns_or_aggregates
FROM table
INNER JOIN another_table
    ON matching_keys
WHERE row_conditions
GROUP BY grouping_columns
HAVING aggregate_conditions
ORDER BY sorting_columns
LIMIT number_of_rows;
```

The clauses are optional, but when used they must appear in this written order.

---

## References

- [neuefische Intro to SQL repository](https://github.com/neuefische/ds-sql-intro)
- [neuefische Intermediate SQL repository](https://github.com/neuefische/ds-sql-intermediate)
- [Codecademy: Learn SQL](https://www.codecademy.com/learn/learn-sql)
- [SQLite documentation](https://www.sqlite.org/docs.html)
