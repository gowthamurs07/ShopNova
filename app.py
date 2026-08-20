from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------
# PRODUCT DATA
# ---------------------------------------------------------

PRODUCTS = [
    {
        "id": 1,
        "name": "Nova X Pro Smartphone",
        "category": "Electronics",
        "price": 54999,
        "old_price": 64999,
        "discount": 15,
        "rating": 4.8,
        "reviews": 1248,
        "badge": "Best Seller",
        "stock": 18,
        "brand": "Nova",
        "description": "Flagship smartphone with a stunning AMOLED display, powerful processor and professional camera system.",
        "features": [
            "6.7-inch AMOLED Display",
            "256GB Storage",
            "50MP Pro Camera",
            "5000mAh Battery",
            "5G Connectivity"
        ],
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 2,
        "name": "AirBeat Pro Headphones",
        "category": "Electronics",
        "price": 7999,
        "old_price": 11999,
        "discount": 33,
        "rating": 4.7,
        "reviews": 865,
        "badge": "Hot Deal",
        "stock": 32,
        "brand": "AirBeat",
        "description": "Premium wireless headphones with active noise cancellation and immersive studio-quality sound.",
        "features": [
            "Active Noise Cancellation",
            "40 Hours Battery",
            "Bluetooth 5.3",
            "Fast Charging",
            "Touch Controls"
        ],
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 3,
        "name": "FitTrack Smart Watch",
        "category": "Electronics",
        "price": 4299,
        "old_price": 6999,
        "discount": 39,
        "rating": 4.6,
        "reviews": 742,
        "badge": "Trending",
        "stock": 25,
        "brand": "FitTrack",
        "description": "Advanced smartwatch for fitness tracking, notifications, heart monitoring and everyday productivity.",
        "features": [
            "AMOLED Display",
            "Heart Rate Monitor",
            "Sleep Tracking",
            "7-Day Battery",
            "Water Resistant"
        ],
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 4,
        "name": "UltraBook Air 14",
        "category": "Computers",
        "price": 72999,
        "old_price": 89999,
        "discount": 19,
        "rating": 4.9,
        "reviews": 528,
        "badge": "Premium",
        "stock": 9,
        "brand": "UltraBook",
        "description": "Slim and powerful 14-inch laptop designed for productivity, creativity and entertainment.",
        "features": [
            "14-inch 2.8K Display",
            "16GB RAM",
            "512GB SSD",
            "Backlit Keyboard",
            "Up to 14 Hours Battery"
        ],
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 5,
        "name": "Urban Runner X",
        "category": "Fashion",
        "price": 2999,
        "old_price": 4999,
        "discount": 40,
        "rating": 4.5,
        "reviews": 934,
        "badge": "40% OFF",
        "stock": 44,
        "brand": "Urban",
        "description": "Lightweight everyday sneakers with responsive cushioning and a stylish urban design.",
        "features": [
            "Breathable Upper",
            "Lightweight Sole",
            "Cushioned Footbed",
            "Anti-Slip Grip",
            "Everyday Comfort"
        ],
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 6,
        "name": "Classic Leather Backpack",
        "category": "Fashion",
        "price": 1899,
        "old_price": 2999,
        "discount": 37,
        "rating": 4.7,
        "reviews": 613,
        "badge": "Popular",
        "stock": 36,
        "brand": "UrbanCraft",
        "description": "Elegant and durable backpack with multiple compartments for work, college and travel.",
        "features": [
            "Premium Finish",
            "Laptop Compartment",
            "Multiple Pockets",
            "Water Resistant",
            "Adjustable Straps"
        ],
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 7,
        "name": "Minimalist Hoodie",
        "category": "Fashion",
        "price": 1599,
        "old_price": 2499,
        "discount": 36,
        "rating": 4.4,
        "reviews": 386,
        "badge": "New",
        "stock": 51,
        "brand": "NorthLine",
        "description": "Soft premium cotton hoodie with a clean minimalist design for everyday wear.",
        "features": [
            "Premium Cotton",
            "Soft Interior",
            "Relaxed Fit",
            "Machine Washable",
            "Unisex Design"
        ],
        "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 8,
        "name": "HomeBrew Coffee Maker",
        "category": "Home",
        "price": 3499,
        "old_price": 5499,
        "discount": 36,
        "rating": 4.6,
        "reviews": 421,
        "badge": "Top Rated",
        "stock": 20,
        "brand": "HomeBrew",
        "description": "Compact coffee maker for delicious café-style coffee at home.",
        "features": [
            "1.2L Capacity",
            "Fast Brewing",
            "Reusable Filter",
            "Auto Shut-Off",
            "Easy Cleaning"
        ],
        "image": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 9,
        "name": "Smart LED Desk Lamp",
        "category": "Home",
        "price": 1299,
        "old_price": 1999,
        "discount": 35,
        "rating": 4.5,
        "reviews": 298,
        "badge": "Smart Home",
        "stock": 67,
        "brand": "Luma",
        "description": "Modern smart desk lamp with adjustable brightness and multiple color temperatures.",
        "features": [
            "Touch Controls",
            "Adjustable Brightness",
            "Multiple Color Modes",
            "USB Charging",
            "Energy Efficient"
        ],
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 10,
        "name": "Pro Gaming Mouse",
        "category": "Gaming",
        "price": 2199,
        "old_price": 3499,
        "discount": 37,
        "rating": 4.8,
        "reviews": 1052,
        "badge": "Gamer Choice",
        "stock": 29,
        "brand": "GamePro",
        "description": "High precision gaming mouse with programmable buttons and customizable RGB lighting.",
        "features": [
            "26,000 DPI Sensor",
            "RGB Lighting",
            "Programmable Buttons",
            "Ultra-Lightweight",
            "Braided Cable"
        ],
        "image": "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 11,
        "name": "Mechanical Gaming Keyboard",
        "category": "Gaming",
        "price": 4999,
        "old_price": 6999,
        "discount": 29,
        "rating": 4.7,
        "reviews": 689,
        "badge": "Best Seller",
        "stock": 17,
        "brand": "GamePro",
        "description": "Responsive mechanical keyboard with RGB lighting and premium switches.",
        "features": [
            "Mechanical Switches",
            "RGB Backlight",
            "Anti-Ghosting",
            "Detachable Cable",
            "Aluminium Frame"
        ],
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80"
    },
    {
        "id": 12,
        "name": "Premium Travel Suitcase",
        "category": "Travel",
        "price": 5499,
        "old_price": 7999,
        "discount": 31,
        "rating": 4.6,
        "reviews": 347,
        "badge": "Travel Pick",
        "stock": 14,
        "brand": "Voyage",
        "description": "Durable lightweight suitcase with secure locks and smooth 360-degree wheels.",
        "features": [
            "TSA Lock",
            "360° Wheels",
            "Hard Shell",
            "Expandable Design",
            "Lightweight"
        ],
        "image": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=900&q=80"
    }
]


# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")


# ---------------------------------------------------------
# API
# ---------------------------------------------------------

@app.route("/api/products")
def get_products():
    return jsonify({
        "success": True,
        "products": PRODUCTS
    })


@app.route("/api/products/<int:product_id>")
def get_product(product_id):
    product = next(
        (p for p in PRODUCTS if p["id"] == product_id),
        None
    )

    if not product:
        return jsonify({
            "success": False,
            "message": "Product not found"
        }), 404

    return jsonify({
        "success": True,
        "product": product
    })


@app.route("/api/categories")
def get_categories():
    categories = sorted(
        list(set(product["category"] for product in PRODUCTS))
    )

    return jsonify({
        "success": True,
        "categories": categories
    })


@app.route("/api/order", methods=["POST"])
def create_order():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid order data"
        }), 400

    customer = data.get("customer", {})
    cart = data.get("cart", [])
    payment_method = data.get("payment_method", "Cash on Delivery")

    if not customer.get("name"):
        return jsonify({
            "success": False,
            "message": "Customer name is required"
        }), 400

    if not customer.get("email"):
        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400

    if not cart:
        return jsonify({
            "success": False,
            "message": "Cart is empty"
        }), 400

    subtotal = 0

    for item in cart:
        subtotal += (
            float(item.get("price", 0))
            * int(item.get("quantity", 1))
        )

    discount = float(data.get("discount", 0))
    shipping = 0 if subtotal >= 1000 else 79
    tax = subtotal * 0.05

    total = subtotal - discount + shipping + tax

    order_id = "ORD-" + datetime.now().strftime("%Y%m%d%H%M%S")

    return jsonify({
        "success": True,
        "message": "Order placed successfully!",
        "order_id": order_id,
        "payment_method": payment_method,
        "total": round(total, 2)
    })


@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "")
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    return jsonify({
        "success": True,
        "message": "Login successful!",
        "user": {
            "name": email.split("@")[0].title(),
            "email": email
        }
    })


# ---------------------------------------------------------
# START SERVER
# ---------------------------------------------------------

if __name__ == "__main__":
    print("=" * 55)
    print("        SHOPNOVA ECOMMERCE SERVER")
    print("=" * 55)
    print("Server running at: http://127.0.0.1:5000")
    print("=" * 55)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )