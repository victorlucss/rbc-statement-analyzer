import html
import json
import re
from datetime import datetime
from typing import List, Optional
import fitz

from .entities import Transaction
from .utils import match_category, parse_float, read_pdf, should_exclude

PAT_FILE_PATH = r"statement"
PAT_MONTH = r"jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec"
PAT_DAY = r"\d{1,2}"
PAT_YEAR = r"\d{4}"
PAT_DATE_SHORT = rf"(?:{PAT_MONTH}) {PAT_DAY}"
PAT_DATE_LONG = rf"((?:{PAT_MONTH})) ({PAT_DAY})(?:, )?({PAT_YEAR})?"
PAT_AMOUNT = r"-?\$[\d,]+\.\d{2}"
PAT_CODE = r"\d{23}"


def is_visa(file_path: str) -> bool:
    return bool(re.search(PAT_FILE_PATH, file_path, re.IGNORECASE))


def extract_start_date(pdf: str) -> Optional[datetime]:
    regex = rf"statement from ({PAT_DATE_LONG}) to ({PAT_DATE_LONG})"

    if match := re.search(regex, pdf, re.IGNORECASE):
        end_year = match[8]
        start_month = match[2]
        start_day = match[3]
        start_year = match[4] or end_year

        return parse_date(f"{start_month} {start_day} {start_year}")

    return None


def parse_date(string: str) -> datetime:
    return datetime.strptime(string, "%b %d %Y")


def parse_transaction(
    line: str,
    start_date: datetime,
    categories: dict,
    excludes: list,
) -> Optional[Transaction]:
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

    category = match_category(description, lookup=categories) or "Other"
    ref_date = parse_date(f"{date} {start_date.year}")
    ref_year = start_date.year + (1 if ref_date.month < start_date.month else 0)

    return {
        "amount": parse_float(amount) * -1,
        "method": "visa",
        "category": category,
        "code": code,
        "date": parse_date(f"{date} {ref_year}"),
        "description": description,
        "posting_date": parse_date(f"{posting_date} {ref_year}"),
    }

def transactionsToJson(transactions_str: str) -> str:
    # Split transactions string into lines and parse each line
    transactions = []
    for line in transactions_str.splitlines():
        if not line.strip():
            continue
            
        # Split line by tabs to get fields
        fields = line.split('\t')
        if len(fields) != 6:
            continue
            
        date, method, code, description, category, amount = fields
        
        transactions.append({
            'date': date,
            'posting_date': date, # Use same date since posting date not in string
            'method': method.strip(),
            'code': code.strip(),
            'description': description.strip(),
            'category': category.strip(),
            'amount': abs(float(amount.strip()))
        })
        
    return json.dumps(transactions, indent=2)

def parse_visa(
    pdf: str,
    categories: Optional[dict],
    excludes: Optional[list],
) -> List[Transaction]:
    print(pdf)

    document = fitz.open(stream=pdf.stream, filetype="pdf")
    string = ""

    # for page_num in range(len(document)):
    #     page = document.load_page(page_num)
    #     string += page.get_text("html" if html else "text")

    print('cheguei aqui', document)
    

    # start_date = extract_start_date(string)

    # lines = re.sub(
    #     rf"\n(?!{PAT_DATE_SHORT}\n{PAT_DATE_SHORT})",
    #     " ",
    #     pdf,
    #     flags=re.IGNORECASE,
    # )

    # transactions = [
    #     tx
    #     for line in lines.splitlines()
    #     if (tx := parse_transaction(line, start_date, categories or {}, excludes or []))
    # ]

    return []
