# VÉRA – Fashion E-Commerce Website

VÉRA is a fashion e-commerce web application built using Next.js, FastAPI, and MySQL. It provides a simple shopping experience with product listings, a shopping bag, checkout, and order management.

## Features

- Product listing from MySQL database
- Add products to shopping bag
- Shopping cart and checkout workflow
- Demo payment flow
- Order creation and order history
- Stock validation and automatic stock updates
- REST API integration

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Backend**
- Python
- FastAPI
- MySQL
- REST API

## Project Structure

```text
vera-fashion-store/
├── fashion-store/       # Next.js frontend
├── fashion-backend/     # FastAPI backend
└── .gitignore
```

## Run Locally

### 1. Backend

```bash
cd fashion-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 2. Frontend

```bash
cd fashion-store
npm install
npm run dev
```

Frontend: http://localhost:3000

## Database

Create a MySQL database named `vera_db` and configure your database password using the `MYSQL_PASSWORD` environment variable in your local `.env` file.

**Note:** This project currently uses a demo payment flow. It does not process real payments.

## Author

Deepika

GitHub: [@deepika0716](https://github.com/deepika0716)
