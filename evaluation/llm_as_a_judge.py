import os
import openai
import pandas as pd
from tqdm import tqdm

openai.api_key = os.getenv("OPENAI_API_KEY")

# === Load dataset ===
# question, base_response, finetuned_response
df = pd.read_csv("financial_model_responses.csv")

# === GPT-4 Evaluation Prompt Template ===
def build_prompt(question, answer_a, answer_b):
    return f"""
You are a strict, unbiased evaluator for financial question-answering models.

You will be given:
- A real-world financial question
- Two answers (Answer A and Answer B), from two different models

Evaluate each answer using the following criteria (1 to 5):
1. Clarity
2. Accuracy
3. Helpfulness
4. Relevance

Be fair, detailed, and objective in your scoring.

---

Question:  
{question}

Answer A:  
{answer_a}

Answer B:  
{answer_b}

Provide your output in **this exact format**:

### Evaluation for Answer A:
- Clarity: #
- Accuracy: #
- Helpfulness: #
- Relevance: #

### Evaluation for Answer B:
- Clarity: #
- Accuracy: #
- Helpfulness: #
- Relevance: #

Then briefly explain your reasoning for the scores.
"""

# === Call GPT-4 ===
def score_with_gpt4(question, a, b):
    prompt = build_prompt(question, a, b)
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert evaluator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
        )
        return response["choices"][0]["message"]["content"]
    except Exception as e:
        print("Error:", e)
        return "Error"

# === Parse GPT-4's structured score block ===
import re

def extract_scores(text):
    pattern = r"(Answer [AB]):\s*- Clarity: (\d).*?- Accuracy: (\d).*?- Helpfulness: (\d).*?- Relevance: (\d)"
    matches = re.findall(pattern, text, re.DOTALL)
    scores = {}
    for match in matches:
        answer = match[0][-1]  # 'A' or 'B'
        scores[answer] = {
            "clarity": int(match[1]),
            "accuracy": int(match[2]),
            "helpfulness": int(match[3]),
            "relevance": int(match[4])
        }
    return scores

# === Run Evaluation ===
results = []

for _, row in tqdm(df.iterrows(), total=len(df)):
    question = row["question"]
    base = row["base_response"]
    fine = row["finetuned_response"]

    # Blind test: randomly shuffle order
    import random
    if random.random() > 0.5:
        a, b = base, fine
        a_label, b_label = "base", "fine"
    else:
        a, b = fine, base
        a_label, b_label = "fine", "base"

    raw_eval = score_with_gpt4(question, a, b)
    scores = extract_scores(raw_eval)

    if not scores:
        continue

    # Align back to original model names
    result = {
        "question": question,
        "raw_eval": raw_eval,
        f"{a_label}_clarity": scores["A"]["clarity"],
        f"{a_label}_accuracy": scores["A"]["accuracy"],
        f"{a_label}_helpfulness": scores["A"]["helpfulness"],
        f"{a_label}_relevance": scores["A"]["relevance"],
        f"{b_label}_clarity": scores["B"]["clarity"],
        f"{b_label}_accuracy": scores["B"]["accuracy"],
        f"{b_label}_helpfulness": scores["B"]["helpfulness"],
        f"{b_label}_relevance": scores["B"]["relevance"],
    }

    results.append(result)

# === Output ===
output_df = pd.DataFrame(results)
output_df.to_csv("gpt4_model_eval_results.csv", index=False)
print("Evaluation complete. Results saved to gpt4_model_eval_results.csv")
