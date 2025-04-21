"""
Loads raw bank transaction data and applies two labeling strategies:
1. Zero-shot classification using a transformer model (BART)
2. Rule-based naive labeling using keyword matching

These provide both a semantic and heuristic baseline for downstream modeling.

Saves:
- checkpoint_zeroshot_10k_random.csv (zero-shot labels)
- checkpoint_naive_10k.csv (naive keyword-based labels)
"""

import pandas as pd
from kagglehub import load_dataset, KaggleDatasetAdapter
from transformers import pipeline
from tqdm import tqdm
import torch

# Load dataset from KaggleHub
file_path = "bank.xlsx"
df = load_dataset(
    KaggleDatasetAdapter.PANDAS,
    "apoorvwatsky/bank-transaction-data",
    file_path,
    pandas_kwargs={"sheet_name": "Sheet1"}
)

print("Loaded Sheet1:")
print(df.head())

# Random sample of 10,000 rows for classification
df_sampled = df.sample(n=10000, random_state=42).copy()

# Zero-shot classification setup
device = 0 if torch.cuda.is_available() else -1
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=device)

labels = [
    'Transfers', 'ATM Withdrawal', 'Bank Fees', 'Bills', 'Cash Deposit', 'Cash Withdrawal',
    'Charity', 'Dining', 'Education', 'Entertainment', 'Fuel', 'Groceries', 'Healthcare',
    'Income', 'Insurance', 'Investment', 'Loan Payment', 'Mobile Recharge', 'Online Shopping',
    'Rent', 'Salary', 'Savings', 'Services', 'Shopping', 'Subscriptions', 'Taxes', 'Telecom',
    'Transport', 'Travel', 'Utilities', 'Credit Card Payment', 'Interest Income',
    'Miscellaneous', 'Business Expense', 'Government Payment', 'Mutual Funds', 'EMI Payment',
    'Maintenance Fee', 'Internet Services', 'Streaming Services'
]

# Run zero-shot classification
def classify_row(text):
    result = classifier(str(text), candidate_labels=labels)
    return result['labels'][0]

df_sampled['ZeroShotCategory'] = [
    classify_row(row) for row in tqdm(df_sampled['TRANSACTION DETAILS'], desc="🔍 Zero-Shot Classification (10k)")
]

df_sampled.to_csv("checkpoint_zeroshot_10k_random.csv", index=False)
print("Zero-shot classification saved.")

# Naive rule-based categorization
keyword_map = {
    'Transport': ['uber', 'lyft', 'metro', 'bus', 'train', 'fuel', 'shell', 'gas'],
    'Food': ['starbucks', 'mcdonald', 'kfc', 'pizza', 'zomato', 'restaurant', 'ubereats'],
    'Shopping': ['amazon', 'walmart', 'shopping', 'flipkart'],
    'Groceries': ['grocery', 'supermarket', 'aldi', 'kroger'],
    'Rent': ['rent', 'apartment', 'lease'],
    'Bills': ['electric', 'water bill', 'internet', 'wifi', 'utility'],
    'Telecom': ['airtel', 'jio', 'recharge', 'mobile bill'],
    'Services': ['consulting', 'repair', 'services'],
    'Entertainment': ['netflix', 'spotify', 'youtube', 'theatre'],
    'Health': ['hospital', 'clinic', 'pharmacy', 'medical'],
    'Insurance': ['insurance', 'premium'],
    'Education': ['tuition', 'school', 'college', 'udemy'],
    'Salary': ['salary', 'payroll'],
    'Investments': ['stock', 'mutual fund', 'sip', 'investment'],
    'Transfers': ['neft', 'upi', 'paypal', 'fund'],
    'Bank Ops': ['atm', 'txn', 'fee', 'deposit', 'interest'],
    'Loans': ['loan', 'emi', 'mortgage'],
    'Charity': ['donation', 'charity'],
    'Subscription': ['subscription', 'recurring', 'membership'],
    'Miscellaneous': ['misc', 'charges']
}

def naive_label(desc):
    desc = str(desc).lower()
    for cat, keywords in keyword_map.items():
        if any(word in desc for word in keywords):
            return cat
    return 'Other'

df_sampled['NaiveCategory'] = df_sampled['TRANSACTION DETAILS'].apply(naive_label)
df_sampled.to_csv("checkpoint_naive_10k.csv", index=False)
print("Naive categorization saved.")
