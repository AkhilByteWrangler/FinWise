import sys
import json
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

def main():
    if len(sys.argv) != 4:
        print("Usage: python categorize.py <transactions_file> <model_file> <vectorizer_file>")
        sys.exit(1)
    
    transactions_file = sys.argv[1]
    model_file = sys.argv[2]
    vectorizer_file = sys.argv[3]
    
    # Load transactions
    with open(transactions_file, 'r') as f:
        transactions = json.load(f)
    
    # Load the model and vectorizer
    with open(model_file, 'rb') as f:
        model = pickle.load(f)
    
    with open(vectorizer_file, 'rb') as f:
        vectorizer = pickle.load(f)
    
    # Extract descriptions
    descriptions = [t['description'] for t in transactions]
    
    # Transform descriptions using the vectorizer
    X = vectorizer.transform(descriptions)
    
    # Predict categories
    categories = model.predict(X)
    
    # Update transactions with predicted categories
    for i, transaction in enumerate(transactions):
        transaction['category'] = categories[i]
    
    # Output the categorized transactions
    print(json.dumps(transactions))

if __name__ == "__main__":
    main()
