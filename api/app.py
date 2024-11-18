from datetime import datetime
from typing import Optional
import fitz  # PyMuPDF
import re
from flask import Flask, request, jsonify
from typing import List, Dict

app = Flask(__name__)


PAT_MONTH = r"jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec"
PAT_DAY = r"\d{1,2}"
PAT_YEAR = r"\d{4}"
PAT_DATE_SHORT = rf"(?:{PAT_MONTH}) {PAT_DAY}"
PAT_DATE_LONG = rf"((?:{PAT_MONTH})) ({PAT_DAY})(?:, )?({PAT_YEAR})?"
PAT_AMOUNT = r"-?\$[\d,]+\.\d{2}"
PAT_CODE = r"\d{23}"

def should_exclude(description: str, lookup: list) -> bool:
    for regex in lookup:
        if re.match(regex, description, re.IGNORECASE):
            return True

    return False


def parse_float(string: str):
    return float(string.replace("$", "").replace(",", ""))


def parse_date(string: str) -> datetime:
    return datetime.strptime(string, "%b %d %Y")

def extract_start_date(pdf: str) -> Optional[datetime]:
    regex = rf"statement from ({PAT_DATE_LONG}) to ({PAT_DATE_LONG})"

    if match := re.search(regex, pdf, re.IGNORECASE):
        end_year = match[8]
        start_month = match[2]
        start_day = match[3]
        start_year = match[4] or end_year

        return parse_date(f"{start_month} {start_day} {start_year}")

    return None


def parse_transaction(
    line,
    start_date,
    categories,
    excludes,
):
    if (
        match := re.match(
            rf"^({PAT_DATE_SHORT})\s+?({PAT_DATE_SHORT})\s+?(.*?)\s+?({PAT_AMOUNT})",
            line,
            re.IGNORECASE,
        )
    ) is None:
        return None

    date, posting_date, body, amount = match.groups()
    code = res.group(0) if (res := re.search(PAT_CODE, body, re.IGNORECASE)) else None
    description = body.replace(f" {code}", "") if code else body

    if should_exclude(description, lookup=excludes):
        return None

    category = "Other"
    ref_date = parse_date(f"{date} {start_date.year}")
    ref_year = start_date.year + (1 if ref_date.month < start_date.month else 0)

    return {
        "amount": abs(parse_float(amount)),
        "method": "visa",
        "category": category,
        "code": code,
        "date": parse_date(f"{date} {ref_year}"),
        "description": description,
        "posting_date": parse_date(f"{posting_date} {ref_year}"),
    }

def process_pdf(file, categories=None, excludes=["PAYMENT"]):
    try:
        # Read the file content as bytes
        pdf_bytes = file.read()

        # Open the PDF using bytes
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
            text = ""
            for page_num in range(len(pdf)):
                page = pdf[page_num]
                text += page.get_text()

        # Extract the start date from the text
        start_date = extract_start_date(text)
        if not start_date:
            raise ValueError("No valid start date found in the PDF.")

        # Combine lines appropriately to prepare for transaction parsing
        combined_lines = re.sub(
            rf"\n(?!{PAT_DATE_SHORT}\n{PAT_DATE_SHORT})", " ", text, flags=re.IGNORECASE
        )

        # Parse each line to extract transactions
        transactions = [
            tx
            for line in combined_lines.splitlines()
            if (tx := parse_transaction(line, start_date, categories or {}, excludes or []))
        ]

        return transactions
    except Exception as e:
        return {"error": str(e)}



# def get_data(data: List[Dict]) -> Dict:
#     groups = {
#         'restaurant': [
#             "PIZZA PIZZA", "TIM HORTONS", "LAURA SECORD", "MUFFIN PLUS", "LA CREMIERE", 
#             "POULET ROUGE", "PATISSERIE COCO", "CAFE MYRIADE", "ICHIRAKU KAWAKI", "CHUNGCHUN KOGO", 
#             "SQ *ALDO CAFE"
#         ],
#         'groceries': ["ADONIS", "INSTACAR", "DOLLARAMA", "METRO ETS"],
#         'pharmacy': ["JEAN COUTU", "PHARMAPRIX"]
#     }

#     def filter_data(group: List[str], data: List[Dict]) -> List[Dict]:
#         return [item for item in data if any(term in item["description"].upper() for term in group)]

#     restaurants = filter_data(groups['restaurant'], data)
#     groceries = filter_data(groups['groceries'], data)
#     pharmacy = filter_data(groups['pharmacy'], data)

#     def total(data_to_total: List[Dict]) -> float:
#         return sum(abs(float(item["amount"])) for item in data_to_total)

#     return {
#         "total": total(data),
#         "restaurantsTotal": total(restaurants),
#         "groceriesTotal": total(groceries),
#         "pharmacyTotal": total(pharmacy),
#         "data": data
#     }





@app.route('/create', methods=['POST'])
def create():
    try:
        # Parse file from the request
        uploaded_file = request.files.get('files')
        if not uploaded_file:
            return jsonify({"error": "No file uploaded"}), 400

        # Ensure it's a PDF
        if uploaded_file.content_type != "application/pdf":
            return jsonify({"error": "Uploaded file is not a PDF"}), 400

        # Process the PDF
        pdf_result = process_pdf(uploaded_file)
        # processed_transactions = get_data(pdf_result)

        return jsonify(pdf_result), 200

    except Exception as e:
        # Handle exceptions gracefully
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Ensure debug mode is off in production
    app.run(host="0.0.0.0", port=8000, debug=True)
