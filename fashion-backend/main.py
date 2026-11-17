from dotenv import load_dotenv
import os
import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
load_dotenv()

app = FastAPI(title="VERA Fashion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL connection

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQLHOST"),
        user=os.getenv("MYSQLUSER"),
        password=os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQLDATABASE"),
        port=int(os.getenv("MYSQLPORT", "3306"))
    )



# Demo products inserted only when the table is empty
DEMO_PRODUCTS = [
    (
        "Sculpted Blazer", "Clothing", 2499,
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
        "BESTSELLER", 10
    ),
    (
        "Everyday Sneakers", "Shoes", 1999,
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        "POPULAR", 10
    ),
    (
        "Beauty Essentials", "Beauty", 999,
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
        "NEW", 10
    )
]


@app.on_event("startup")
def initialize_products():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM products")
    count = cursor.fetchone()[0]

    if count == 0:
        cursor.executemany(
            """
            INSERT INTO products
            (name, category, price, image, label, stock)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            DEMO_PRODUCTS
        )
        connection.commit()

    cursor.close()
    connection.close()


class OrderItem(BaseModel):
    product_id: int
    quantity: int


class Customer(BaseModel):
    name: str
    email: str
    address: str


class OrderRequest(BaseModel):
    customer: Customer
    items: List[OrderItem]


@app.get("/")
def home():
    return {"message": "Welcome to VERA Fashion Store Backend!"}


@app.get("/products")
def get_products():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, name, category, price, image, label, stock
        FROM products
        ORDER BY id
        """
    )

    products = cursor.fetchall()

    cursor.close()
    connection.close()

    for product in products:
        product["price"] = float(product["price"])

    return products


@app.post("/orders")
def create_order(order: OrderRequest):
    if not order.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        subtotal = 0
        saved_items = []

        # Check products and stock
        for item in order.items:
            if item.quantity < 1:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid quantity"
                )

            cursor.execute(
                """
                SELECT id, name, price, stock
                FROM products
                WHERE id = %s
                FOR UPDATE
                """,
                (item.product_id,)
            )

            product = cursor.fetchone()

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail="Product not found"
                )

            if product["stock"] < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product['name']}"
                )

            price = float(product["price"])
            item_total = price * item.quantity
            subtotal += item_total

            saved_items.append({
                "product_id": product["id"],
                "name": product["name"],
                "price": price,
                "quantity": item.quantity,
                "item_total": item_total
            })

        shipping = 0 if subtotal >= 2499 else 99
        total = subtotal + shipping

        # Save order
        cursor.execute(
            """
            INSERT INTO orders
            (customer_name, email, address, subtotal,
             shipping, total, payment_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                order.customer.name,
                order.customer.email,
                order.customer.address,
                subtotal,
                shipping,
                total,
                "DEMO_SUCCESS"
            )
        )

        order_id = cursor.lastrowid

        # Save order items and update stock
        for item in order.items:
            product = next(
                p for p in saved_items
                if p["product_id"] == item.product_id
            )

            cursor.execute(
                """
                INSERT INTO order_items
                (order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    order_id,
                    item.product_id,
                    item.quantity,
                    product["price"]
                )
            )

            cursor.execute(
                """
                UPDATE products
                SET stock = stock - %s
                WHERE id = %s
                """,
                (item.quantity, item.product_id)
            )

        connection.commit()

        return {
            "message": "Order placed successfully",
            "order": {
                "order_id": order_id,
                "customer": order.customer.model_dump(),
                "items": saved_items,
                "subtotal": subtotal,
                "shipping": shipping,
                "total": total,
                "payment_status": "DEMO_SUCCESS"
            }
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception as error:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(error))

    finally:
        cursor.close()
        connection.close()


@app.get("/orders")
def get_orders():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT * FROM orders
            ORDER BY id DESC
            """
        )
        orders = cursor.fetchall()

        result = []

        for order in orders:
            cursor.execute(
                """
                SELECT oi.product_id, p.name, oi.price, oi.quantity,
                       (oi.price * oi.quantity) AS item_total
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = %s
                """,
                (order["id"],)
            )

            items = cursor.fetchall()

            result.append({
                "order_id": order["id"],
                "customer": {
                    "name": order["customer_name"],
                    "email": order["email"],
                    "address": order["address"]
                },
                "items": items,
                "subtotal": float(order["subtotal"]),
                "shipping": float(order["shipping"]),
                "total": float(order["total"]),
                "payment_status": order["payment_status"],
                "created_at": str(order["created_at"])
            })

        return result

    finally:
        cursor.close()
        connection.close()
