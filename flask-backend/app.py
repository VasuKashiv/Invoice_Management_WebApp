from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import google.generativeai as genai
import os
import json
from werkzeug.utils import secure_filename
import PyPDF2
import base64
import pandas as pd
import re

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Fix CORS for all routes

# ✅ MongoDB Connection
client = MongoClient(MONGO_URI)
db = client["invoice_management"]
invoices_collection = db["invoices"]
products_collection = db["products"]
customers_collection = db["customers"]

# ✅ Configure Google Gemini API
genai.configure(api_key=GEMINI_API_KEY)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {"pdf", "jpg", "png", "jpeg", "xls", "xlsx"}

# ✅ Extract text from PDF
def extract_text_from_pdf(file_path):
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        return text
    except Exception as e:
        return str(e)

# ✅ Extract text from Excel
def extract_text_from_excel(file_path):
    try:
        df = pd.read_excel(file_path)
        csv_data = df.to_csv(index=False, sep="|")  # Convert to structured format
        return f"Extracted Excel Data:\n{csv_data}"
    except Exception as e:
        return str(e)

def clean_numeric(value):
    """Removes commas and converts to float."""
    if isinstance(value, str):
        value = value.replace(",", "")  # Remove commas
    try:
        return float(value)
    except ValueError:
        return 0.0  # Default to 0.0 if invalid
# ✅ Extract Invoice Data Using Google Gemini AI
def extract_invoice_data(file_path, file_extension):
    """Extracts invoice data using Google Gemini AI."""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")

        # ✅ Handle file types
        if file_extension == "pdf":
            file_content = extract_text_from_pdf(file_path)
        elif file_extension in ["xls", "xlsx"]:
            file_content = extract_text_from_excel(file_path)
        else:  # ✅ Images (JPG, PNG, etc.)
            with open(file_path, "rb") as file:
                file_content = base64.b64encode(file.read()).decode("utf-8")


        # ✅ Structured AI Prompt
        prompt = """Extract structured invoice details in valid JSON format.

          **Strict Extraction Rules:**
        - Compute fields only if they are directly not extractable from data.
        - Extract **serial number, customer name, product name, quantity, unit price, tax, total amount, and date** correctly.
        - Ensure `quantity` is **always an integer**.
        - Extract `unit_price` as the **price per item**, not the total price.
        - Compute `price_with_tax` = (`unit_price` * `quantity`) * (1 + `tax` / 100).
        - Ensure `total_amount` = sum of all (`price_with_tax`).
        - Extract `phone_number` in standard format (e.g., `+1XXXXXXXXXX` or `XXXXXXXXXX`).
        - Ensure all numbers are **floats, not strings** (remove commas from large numbers).
        - Validate extracted data to prevent missing fields.
        - Return valid structured JSON without extra text.
        - Total purchase, amount, price etc are same things.
        - 

        **Example JSON Output:**
        ```json
        {
          "invoices": [
            {
              "invoice_number": "INV-123",
              "serial_number": 1,
              "customer_name": "John Doe",
              "total_amount": 12500.50,
              "tax": 5.0,
              "date": "2024-03-10",
              "products": ["PROD1", "PROD2"]
            }
          ],
          "products": [
            {
              "product_id": "PROD1",
              "product_name": "Laptop",
              "quantity": 2,
              "unit_price": 5000.00,
              "tax": 5.0,
              "price_with_tax": 10500.00
            },
            {
              "product_id": "PROD2",
              "product_name": "Mouse",
              "quantity": 1,
              "unit_price": 50.00,
              "tax": 5.0,
              "price_with_tax": 52.50
            }
          ],
          "customers": [
            {
              "customer_id": "CUST1",
              "customer_name": "John Doe",
              "phone_number": "1234567890",
              "total_purchase": 12500.50
            }
          ]
        }```"""

        response = model.generate_content([
            {"text": prompt},  # ✅ Pass the prompt as a dictionary
            {"text": file_content}  # ✅ Pass extracted text content
        ])

        try:
            raw_text =  response.candidates[0].content.parts[0].text # ✅ Extract text

            json_text = re.sub(r"```json\n|\n```", "", raw_text).strip()
            extracted_data = json.loads(json_text)  # ✅ Parse JSON
            print(extracted_data)
            for invoice in extracted_data.get("invoices", []):
                try:
                    invoice["total_amount"] = clean_numeric(invoice.get("total_amount", 0))
                except ValueError:
                    print(f"⚠️ Invalid invoice total: {invoice}")
                    return {"error": "Invalid invoice data format"}

            for product in extracted_data.get("products", []):
                try:
                    product["quantity"] = int(float(product.get("quantity", 1)))  # Ensure integer quantity
                    product["unit_price"] = clean_numeric(product.get("unit_price", 0))  # Ensure float
                    product["tax"] = clean_numeric(product.get("tax", 5))  # Default tax to 5%
                    product["price_with_tax"] = round(product["unit_price"] * product["quantity"] * (1 + (product["tax"] / 100)), 2)
                except ValueError:
                    print(f"⚠️ Invalid product data: {product}")
                    return {"error": "Invalid product data format"}

            for customer in extracted_data.get("customers", []):
                try:
                    customer["total_purchase"] = clean_numeric(customer.get("total_purchase", 0))
                    customer["phone_number"] = str(customer.get("phone_number", "Unknown")).strip()
                except ValueError:
                    print(f"⚠️ Invalid customer data: {customer}")
                    return {"error": "Invalid customer data format"}
          
            return extracted_data
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            print("❌ AI Response Parsing Error:", str(e))
            return {"error": "AI response is not in valid JSON format"}
    except Exception as e:
        print("❌ Error in AI extraction:", str(e))
        return {"error": str(e)}
    
# ✅ Upload and Extract Invoice Data
@app.route("/api/upload", methods=["POST"])
def upload_file():
    """Handles file upload and AI extraction."""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        filename = secure_filename(file.filename)
        file_extension = filename.rsplit(".", 1)[1].lower()

        if file_extension not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Unsupported file type"}), 400

        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)


        extracted_data = extract_invoice_data(file_path, file_extension)

        print(f"🤖 AI Extracted Data: {extracted_data}")  # ✅ Debug AI response

        if extracted_data:
            if "error" in extracted_data:
                print("❌ AI Extraction Error:", extracted_data["error"])
                return jsonify({"error": extracted_data["error"]}), 500

            if "invoices" in extracted_data and extracted_data["invoices"]:
                for invoice in extracted_data["invoices"]:
                    invoice["_id"] = invoice["invoice_number"]  # ✅ Use invoice_number as unique ID
                    invoice["product_ids"] = []  # ✅ Placeholder for linked products
                    invoice["customer_id"] = None  # ✅ Placeholder for linked customer

                    invoices_collection.insert_one(invoice)

            if "customers" in extracted_data and extracted_data["customers"]:
                for customer in extracted_data["customers"]:
                    customer["_id"] = "CUST" + str(len(list(customers_collection.find())) + 1)
                    customer["invoice_id"] = extracted_data["invoices"][0]["_id"]

                    customers_collection.insert_one(customer)
                    invoices_collection.update_one({"_id": extracted_data["invoices"][0]["_id"]}, {"$set": {"customer_id": customer["_id"]}})

            if "products" in extracted_data and extracted_data["products"]:
                for product in extracted_data["products"]:
                    product["_id"] = "PROD" + str(len(list(products_collection.find())) + 1)
                    product["invoice_id"] = extracted_data["invoices"][0]["_id"]

                    products_collection.insert_one(product)
                    invoices_collection.update_one({"_id": extracted_data["invoices"][0]["_id"]}, {"$push": {"product_ids": product["_id"]}})
            return jsonify({"message": "File processed successfully!", "data": extracted_data}), 200
        else:
            return jsonify({"error": "Failed to extract data"}), 500

    except Exception as e:
        print("❌ Upload API Error:", str(e))
        return jsonify({"error": str(e)}), 500

# ✅ API Status Check
@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "Backend is running"}), 200

@app.route("/api/invoices", methods=["GET"])
def get_invoices():
    invoices = list(invoices_collection.find({}))
    updated_invoices = []

    for invoice in invoices:
        customer = customers_collection.find_one({"customer_id": invoice.get("customer_id")}, {"_id": 0})
        products = list(products_collection.find({"product_id": {"$in": invoice.get("product_ids", [])}}, {"_id": 0}))

        invoice["customer"] = customer
        invoice["products"] = products
        updated_invoices.append(invoice)

    return jsonify(updated_invoices), 200

@app.route("/api/invoices/<invoice_id>", methods=["PUT"])
def update_invoice(invoice_id):
    try:
        data = request.json
        result = invoices_collection.update_one({"invoice_number": invoice_id}, {"$set": data})

        if result.matched_count == 0:
            return jsonify({"error": "Invoice not found"}), 404

        # ✅ Fetch latest customer details and update invoices
        if "customer_id" in data:
            customer = customers_collection.find_one({"customer_id": data["customer_id"]}, {"_id": 0})
            invoices_collection.update_many(
                {"invoice_number": invoice_id},
                {"$set": {"customer": customer}}
            )
            customers_collection.update_one(
                {"customer_id": data["customer_id"]},
                {"$set": {"total_purchase": data["total_amount"]}}
            )

        # ✅ Fetch latest product details and update invoices
        if "product_ids" in data:
            products = list(products_collection.find({"product_id": {"$in": data["product_ids"]}}, {"_id": 0}))
            invoices_collection.update_many(
                {"invoice_number": invoice_id},
                {"$set": {"products": products}}
            )
            for product in products:
                products_collection.update_one(
                    {"product_id": product["product_id"]},
                    {"$set": {"quantity": product["quantity"], "unit_price": product["unit_price"]}}
                )

        return jsonify({"message": "Invoice updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        products = list(products_collection.find({}))
        for product in products:
            product["_id"] = str(product["_id"]) 
            product["invoice"] = invoices_collection.find_one({"_id": product["invoice_id"]}, {"_id": 0})

        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/products/<product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.json
    result = products_collection.update_one({"product_id": product_id}, {"$set": data})

    if result.matched_count == 0:
        return jsonify({"error": "Product not found"}), 404

    invoices_collection.update_many(
        {"product_ids": product_id},
        {"$set": {"products.$[elem]": data}},
        array_filters=[{"elem.product_id": product_id}]
    )
    customers_collection.update_many(
        {"customer_id": {"$in": [inv["customer_id"] for inv in invoices_collection.find({"product_ids": product_id})]}},
        {"$inc": {"total_purchase": data.get("unit_price", 0) * data.get("quantity", 1)}}
    )

    return jsonify({"message": "Product updated successfully"}), 200


@app.route("/api/customers", methods=["GET"])
def get_customers():
    try:
        customers = list(customers_collection.find({}))
        for customer in customers:
            customer["_id"] = str(customer["_id"])  # Convert ObjectId to string
            customer["invoice"] = invoices_collection.find_one({"_id": customer["invoice_id"]}, {"_id": 0})

        return jsonify(customers), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/customers/<customer_id>", methods=["PUT"])
def update_customer(customer_id):
    data = request.json
    result = customers_collection.update_one({"customer_id": customer_id}, {"$set": data})

    if result.matched_count == 0:
        return jsonify({"error": "Customer not found"}), 404

    invoices_collection.update_many(
        {"customer_id": customer_id},
        {"$set": {"customer": data}}
    )

    return jsonify({"message": "Customer updated successfully"}), 200


if __name__ == "__main__":
    app.run(debug=True)
