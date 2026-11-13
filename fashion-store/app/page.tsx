
"use client";

import { useState, useEffect } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  label: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function Home() {
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: "",
  });

  const categories = [
    "All",
    "Clothing",
    "Shoes",
    "Beauty",
    "Accessories",
  ];

  useEffect(() => {
    fetch("http://127.0.0.1:8000/products")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load products");
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((error) => console.error("Product error:", error))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts =
    category === "All"
      ? products
      : products.filter((product) => product.category === category);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const shipping = subtotal === 0 || subtotal >= 2499 ? 0 : 99;
  const total = subtotal + shipping;

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  }

  function changeQuantity(productId: number, change: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: number) {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId)
    );
  }

  async function completeDemoPayment(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    const response = await fetch("http://127.0.0.1:8000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Order failed");
    }

    console.log("Order saved:", data.order);
    setOrderSuccess(true);
    setCart([]);
  } catch (error) {
    console.error(error);
    alert("Order failed. Check whether the backend is running.");
  }
}

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#24231f]">
      <div className="bg-[#262720] px-4 py-2 text-center text-xs tracking-[0.18em] text-white">
        COMPLIMENTARY SHIPPING ON ORDERS OVER ₹2,499
      </div>

      <header className="flex items-center justify-between border-b border-black/10 px-5 py-5 md:px-12">
        <a href="#" className="text-2xl font-bold tracking-[0.25em]">
          VÉRA<span className="text-[#a17c53]">.</span>
        </a>

        <nav className="hidden gap-8 text-sm md:flex">
          <a href="#shop" className="hover:text-[#a17c53]">Shop all</a>
          <a href="#shop" className="hover:text-[#a17c53]">New arrivals</a>
          <a href="#categories" className="hover:text-[#a17c53]">Collections</a>
        </nav>

        <button
          onClick={() => {
            setShowCart(true);
            setCheckout(false);
            setOrderSuccess(false);
          }}
          className="border border-black/20 px-4 py-2 text-sm hover:bg-black hover:text-white"
        >
          Bag ({cartCount})
        </button>
      </header>

      <section className="grid min-h-[500px] md:grid-cols-2">
        <div className="flex flex-col items-start justify-center px-7 py-16 md:px-16 lg:px-24">
          <p className="mb-5 text-xs tracking-[0.28em] text-[#92734f]">
            THE NEW SEASON EDIT
          </p>

          <h1 className="max-w-lg text-5xl font-light leading-[1.1] tracking-tight md:text-7xl">
            Style that
            <br />
            speaks <span className="font-serif italic">you.</span>
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-7 text-gray-600">
            Thoughtful essentials, timeless pieces and little luxuries.
            Discover your next favourite thing.
          </p>

          <a
            href="#shop"
            className="mt-8 bg-[#262720] px-8 py-4 text-xs tracking-[0.16em] text-white transition hover:bg-[#92734f]"
          >
            EXPLORE THE COLLECTION →
          </a>
        </div>

        <div className="relative min-h-[350px] overflow-hidden bg-[#e9e1d6]">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200"
            alt="Fashion collection inspiration"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute bottom-6 left-6 bg-white/90 px-5 py-4">
            <p className="text-xs tracking-[0.2em]">CURATED FOR YOU</p>
            <p className="mt-1 font-serif text-xl italic">Wear your story.</p>
          </div>
        </div>
      </section>

      <section id="categories" className="px-5 py-12 md:px-12">
        <div className="mb-6 text-center">
          <p className="text-xs tracking-[0.25em] text-[#92734f]">DISCOVER</p>
          <h2 className="mt-2 font-serif text-3xl">Shop by category</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCategory(item);
                document.getElementById("shop")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className={`border px-5 py-3 text-sm transition ${
                category === item
                  ? "border-[#262720] bg-[#262720] text-white"
                  : "border-black/15 hover:border-black"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section id="shop" className="px-5 pb-20 md:px-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] text-[#92734f]">
              THE VÉRA EDIT
            </p>
            <h2 className="mt-2 font-serif text-3xl">
              {category === "All" ? "Our favourites" : category}
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            {filteredProducts.length} products
          </p>
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-500">
            Loading products...
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            No products found in this category.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#eeeae3]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] tracking-wider">
                    {product.label}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="absolute bottom-3 left-3 right-3 bg-white/95 py-3 text-xs tracking-wider transition hover:bg-[#262720] hover:text-white"
                  >
                    + ADD TO BAG
                  </button>
                </div>

                <div className="flex items-start justify-between gap-2 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                      {product.category}
                    </p>
                    <h3 className="mt-1 text-sm">{product.name}</h3>
                  </div>
                  <p className="whitespace-nowrap text-sm font-medium">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#e9e1d6] px-6 py-16 text-center">
        <p className="text-xs tracking-[0.25em] text-[#92734f]">
          A LITTLE MORE YOU
        </p>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">
          Good style. Good feeling.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-600">
          From everyday essentials to statement pieces, find something
          that feels like you.
        </p>
        <a
          href="#shop"
          className="mt-7 inline-block bg-[#262720] px-8 py-4 text-xs tracking-widest text-white hover:bg-[#92734f]"
        >
          FIND YOUR STYLE
        </a>
      </section>

      <footer className="bg-[#262720] px-6 py-10 text-center text-white">
        <p className="text-xl font-bold tracking-[0.25em]">VÉRA.</p>
        <p className="mt-3 text-xs text-white/60">
          Fashion, beauty & everyday essentials.
        </p>
        <p className="mt-6 text-[10px] text-white/40">
          © 2026 VÉRA. FRONTEND DEMO.
        </p>
      </footer>

      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-[#faf9f6] p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-black/10 pb-5">
              <h2 className="font-serif text-2xl">
                {orderSuccess
                  ? "Thank you!"
                  : checkout
                  ? "Checkout"
                  : "Your Bag"}
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-2xl hover:text-[#92734f]"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {orderSuccess ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9e1d6] text-3xl">
                  ✓
                </div>
                <h3 className="font-serif text-3xl">Order placed!</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Thank you, {customer.name}. Your VÉRA demo order has
                  been completed successfully.
                </p>
                <p className="mt-4 text-sm text-gray-600">
                  Payment demonstration only. No money was charged.
                </p>
                <button
                  onClick={() => {
                    setShowCart(false);
                    setCheckout(false);
                    setOrderSuccess(false);
                  }}
                  className="mt-8 bg-[#262720] px-8 py-4 text-xs tracking-widest text-white"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : checkout ? (
              <form
                onSubmit={completeDemoPayment}
                className="flex flex-1 flex-col gap-5 pt-6"
              >
                <p className="text-xs tracking-widest text-[#92734f]">
                  YOUR DETAILS
                </p>

                <label className="text-sm">
                  Full name
                  <input
                    required
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    className="mt-2 w-full border border-black/20 bg-white p-3 outline-none focus:border-[#92734f]"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="text-sm">
                  Email address
                  <input
                    required
                    type="email"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                    className="mt-2 w-full border border-black/20 bg-white p-3 outline-none focus:border-[#92734f]"
                    placeholder="Enter your email"
                  />
                </label>

                <label className="text-sm">
                  Delivery address
                  <textarea
                    required
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    className="mt-2 w-full border border-black/20 bg-white p-3 outline-none focus:border-[#92734f]"
                    placeholder="Enter your delivery address"
                    rows={3}
                  />
                </label>

                <div className="mt-3 border-t border-black/10 pt-5">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-black/10 pt-4 font-semibold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="bg-[#e9e1d6] p-4 text-xs leading-5 text-gray-700">
                  DEMO PAYMENT: This button simulates a successful payment.
                  It does not charge money or connect to a payment gateway.
                </div>

                <button
                  type="submit"
                  className="mt-auto w-full bg-[#262720] py-4 text-xs tracking-widest text-white hover:bg-[#92734f]"
                >
                  PAY ₹{total.toLocaleString("en-IN")} — DEMO
                </button>

                <button
                  type="button"
                  onClick={() => setCheckout(false)}
                  className="py-2 text-sm text-gray-500 underline"
                >
                  Back to bag
                </button>
              </form>
            ) : (
              <>
                {cart.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <p className="font-serif text-2xl">Your bag is empty.</p>
                    <p className="mt-3 text-sm text-gray-500">
                      Discover something you love.
                    </p>
                    <button
                      onClick={() => setShowCart(false)}
                      className="mt-7 bg-[#262720] px-8 py-4 text-xs tracking-widest text-white"
                    >
                      CONTINUE SHOPPING
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 divide-y divide-black/10">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex gap-4 py-5"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-28 w-24 object-cover"
                          />

                          <div className="flex flex-1 flex-col">
                            <p className="text-xs uppercase tracking-wider text-gray-500">
                              {item.product.category}
                            </p>
                            <h3 className="mt-1 text-sm font-medium">
                              {item.product.name}
                            </h3>
                            <p className="mt-2 text-sm">
                              ₹{item.product.price.toLocaleString("en-IN")}
                            </p>

                            <div className="mt-auto flex items-center gap-3">
                              <button
                                onClick={() =>
                                  changeQuantity(item.product.id, -1)
                                }
                                className="h-7 w-7 border border-black/20"
                              >
                                −
                              </button>
                              <span className="text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  changeQuantity(item.product.id, 1)
                                }
                                className="h-7 w-7 border border-black/20"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="ml-auto text-xs text-gray-500 underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-black/10 pt-5">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>
                          {shipping === 0
                            ? "FREE"
                            : `₹${shipping.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between border-t border-black/10 pt-4 font-semibold">
                        <span>Total</span>
                        <span>₹{total.toLocaleString("en-IN")}</span>
                      </div>

                      <button
                        onClick={() => setCheckout(true)}
                        className="mt-6 w-full bg-[#262720] py-4 text-xs tracking-widest text-white hover:bg-[#92734f]"
                      >
                        PROCEED TO CHECKOUT
                      </button>
                      <p className="mt-3 text-center text-xs text-gray-500">
                        Free shipping on orders above ₹2,499.
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
