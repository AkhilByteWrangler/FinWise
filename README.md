# FinWise – Financial Intelligence through Language Models

[YouTube](https://youtu.be/45Ml2Kxd6RE?si=joz-5LR34-V0tpCs)

[finwise420 Demo](https://finwise420.vercel.app/)

FinWise is an AI-powered personal finance system that tackles **two real-world problems** using modern NLP:

1. A conversational **financial assistant** (Custom Finetuned LLM-powered chatbot)
2. A **bank statement categorizer** that gives users clear insights into their spending

It is deployed on the web (Vercel Cloud), with the chatbot custom finetuned LLM hosted on **RunPod** Custom Pod and the frontend on **Vercel** — fully accessible and functional.

---

## Theme Justification: *Health, Wellness, and Fitness*

> Because **financial health is health** - stress from poor money management is a leading wellness concern.

We directly support this theme by:

1. Educating users on **financial concepts** through Q&A chat
2. Helping users **track and reflect on their spending habits**
3. Offering **categorical spending breakdowns**
4. Lowering barriers with **easy-to-use interfaces**

---

## Project Requirements: How We Fully Address Them

### 1. **Modeling Approaches**
We evaluate three approaches for transaction categorization:

| Approach | Description | Status |
|----------|-------------|--------|
| Naive | Keyword-based matching (e.g., "uber" → Transport) | Implemented and deployed |
| Classical ML | TF-IDF + Random Forest, tuned with Optuna | Implemented (but not deployed) |
| Deep Learning | Fine-tuned BERT | Fully trained + but not deployed |

> We also explored zero-shot learning (BART) to test initial feasibility — further proving our effort went beyond the minimum.

For the ChatBot:

We fine-tuned a Mistral Llama 3.1 B model using LoRA on a publicly available financial Q&A dataset. To evaluate the improvement, we compared the outputs of the pretrained base model and our fine-tuned version using an LLM-as-a-Judge approach. The results showed that the fine-tuned model outperformed the base model across key qualitative metrics, including relevance, clarity, and helpfulness.

### 2. **Final Deliverables**

| Deliverable | Status |
|------------|--------|
| Interactive app | Live at Vercel + RunPod |
| Code repo with structure | [See below](#project-structure) |
| Presentation video | [YouTube](https://youtu.be/45Ml2Kxd6RE?si=joz-5LR34-V0tpCs) |
| Demo pitch (3 min) | In Class |
| Ethics statement | Included in final slides & [repo](#Ethics-Statement) & wesbite |
| Publicly accessible app | [finwise420](https://finwise420.vercel.app/) |
| GitHub repo link | [https://github.com/AkhilByteWrangler/FinWise] |

### 3. **Why We Don't Use BERT / RF in Production**
Although we trained a Random Forest and BERT model as part of our transaction caterogization, they are not deployed because:

- They require Python runtime and **don’t integrate cleanly with Next.js** (especially on Vercel).
- The RF and the finetuned BERT models are **larger and more costly to host**.
- Our fine-tuned Question Answering LLM is **faster, unified**, and performs better across both tasks of handling the ChatBot, and also the transaction categorisation. 

### 4. Problem We Are Addressing

Managing personal finances is confusing, time-consuming, and often intimidating - especially for those without a background in finance. Most people either don't know **where their money is going**, or don’t have **easy access to clear, contextual financial advice**.

At the same time, raw bank statements are hard to understand, and traditional chatbots or banking apps offer **limited intelligence** and **rigid interfaces**.

We address two key pain points:

1. **Lack of financial literacy and instant access to expert advice**
2. **Difficulty in understanding and organizing personal transaction data**

FinWise bridges this gap by combining a **fine-tuned conversational AI assistant** with a **smart bank statement categorizer**, giving users personalized insights, clarity, and guidance — all through a lightweight web app.

---

## What We Built

### Chatbot (Proprietary Knowledge Agent)
- Hosted at: [RunPod URL](https://fpyen3pn2x83pb-8000.proxy.runpod.net/v1/chat/completions)
- Accepts OpenAI-style `POST /v1/chat/completions` requests
- Prompted with Alpaca-style instructions
- Trained using the [FiQA dataset](https://huggingface.co/datasets/LLukas22/fiqa)

### How to Use the Chatbot (RunPod API)

Our Mistral-based model is hosted on RunPod and can be queried directly using `curl`:

### Example `curl` Command

```bash
curl -X POST https://fpyen3pn2x83pb-8000.proxy.runpod.net/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fiqa-mistral-7b-lora",
    "messages": [
      { "role": "user", "content": "Can you explain how a treasury bond works?" }
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

Example Response :

```bash
{
  "id": "chatcmpl-001",
  "object": "chat.completion",
  "model": "fiqa-mistral-7b-lora",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Of course, I'd be happy to help! A Treasury bond..."
    },
    "finish_reason": "stop"
  }]
}
```

### Statement Categorizer
- Upload a CSV file with bank transactions
- Map fields: `Date`, `Description`, `Amount`
- Choose between:
  - **Free (Naive)**: Based on keyword rules
  - **Pro (LLM)**: Sent to our fine-tuned model
- Shows **category breakdown + visualization**

---

## Why the Multi-Step Modeling Pipeline?

We wanted to follow an iterative, evidence-based approach to modeling:

1. **Zero-Shot (BART)** – to test label coverage and feasibility without training
2. **Naive** – super fast, rule-based categorization for free tier
3. **Random Forest** – strong classical ML baseline with explainability
4. **BERT** – robust pretrained model, but costly to host
5. **Fine-tuned Mistral** – best tradeoff between quality, cost, and flexibility — this is what powers both our chatbot and our pro categorizer

---

## Datasets Used

We used two publicly available, high-quality datasets — each serving a distinct part of the FinWise system: transaction categorization and conversational fine-tuning.

### Transaction Categorization

- **Dataset**: [ApoorvWatsky/bank-transaction-data](https://www.kaggle.com/datasets/apoorvwatsky/bank-transaction-data)
- **Description**: A large, anonymized dataset of real-world bank transactions containing fields such as `date`, `amount`, and `transaction description`.
- **Usage**:
  - This dataset was used to **develop our naive rule-based categorizer** using keyword heuristics.
  - We also used it to generate **supervised labels** for training and evaluating classical ML and DL models like Random Forest and BERT.
  - Categories include common financial themes such as `Groceries`, `Bills`, `Transport`, `Entertainment`, etc.

### LLM Fine-Tuning (Chatbot)

- **Dataset**: [LLukas22/fiqa](https://huggingface.co/datasets/LLukas22/fiqa)
- **Description**: The FiQA dataset contains **finance-related question–answer pairs**, curated for training NLP models on financial reasoning tasks.
- **Usage**:
  - We fine-tuned the **Mistral Llama 3.1B model** using LoRA adapters on this dataset.
  - The goal was to enhance the model’s ability to **respond clearly and accurately to financial questions** in a conversational format.
  - This forms the core of the FinWise chatbot experience.

---

## Review of Relevant Previous Efforts & Literature

### 1. **Bank Transaction Categorization**

Bank statement categorization has traditionally been approached in the financial industry using **hardcoded rules** or **merchant code lookups**, often limited in flexibility or accuracy. Recent research and fintech solutions have shifted toward **data-driven categorization** using:

- **Keyword heuristics** (used by apps like Mint and YNAB)
- **Classical machine learning models** such as logistic regression and random forests
- **Deep learning approaches** that apply embeddings and sequence models to financial text

The **[ApoorvWatsky/bank-transaction-data](https://www.kaggle.com/datasets/apoorvwatsky/bank-transaction-data)** dataset has been used in multiple public Kaggle notebooks and blog posts to:
- Benchmark rule-based systems
- Train ML models for personal expense classification
- Evaluate class imbalance and edge cases (e.g. overlapping descriptions)

We extended this work by:
- Building a custom naive keyword model
- Evaluating Random Forest and finetuned BERT
- Deploying an **LLM-based classifier** using our own fine-tuned Mistral model

### 2. **Financial Q&A via LLMs**

The **FiQA dataset** ([LLukas22/fiqa](https://huggingface.co/datasets/LLukas22/fiqa)) is a well-known benchmark in financial NLP, referenced in:

- *FiQA: A Question Answering Dataset for Financial Opinion Analysis* (Maia et al., 2018)
- HuggingFace blog posts on fine-tuning transformers for domain-specific tasks
- Use cases for fine-tuning financial assistants and summarizers

Prior work focuses on:
- Text classification of sentiment and opinions in financial text
- Short-form QA for investor queries
- Sentence embeddings for ranking and retrieval

We contribute by:
- **Fine-tuning a Mistral model with LoRA** on FiQA to create a fully conversational assistant
- Designing a prompt structure optimized for financial tone and clarity
- Deploying it in production using RunPod for inference

### Summary

This project bridges two previously separate domains:
1. Traditional bank transaction parsing and financial text classification
2. Modern LLM-based dialogue generation for finance

We combine these into a unified, accessible product that goes beyond prior efforts by offering **real-time, private, and explainable financial insights** through both a chat interface and structured analysis.

---

## Deployed System Overview

| Component | Tech Stack | Hosting |
|----------|------------|---------|
| Frontend | Next.js + TailwindCSS | Vercel |
| Backend (LLM) | FastAPI + Unsloth | RunPod |
| Storage | In-browser + memory | N/A (stateless) for privacy :) |

> The frontend was partially generated using V0 by Vercel LLM with the prompt:  
> “Given these files of HTML, CSS, and starter NextJS, give me a good website skin.”

---

## Model Evaluation Process & Metric Selection

Our evaluation strategy combined **quantitative metrics** for transaction classification models with **qualitative scoring** for the financial assistant chatbot - using both manual inspection and LLM-assisted judgments.

---

### Transaction Categorization Models

We evaluated three modeling approaches:

| Model           | Approach         | Description                                  |
|------------------|------------------|----------------------------------------------|
| Naive            | Heuristic        | Keyword-based matching for free tier users   |
| Random Forest    | Classical ML     | TF-IDF vectorizer + Optuna-tuned RF model    |
| BERT             | Deep Learning    | Fine-tuned transformer on labeled data       |

---

### Labeling Strategy

- Since **manually labeling thousands of transactions** is labor-intensive, we used **zero-shot learning (BART)** to **bootstrap labels** on a large transaction set.
- We then used this as **pseudo-supervised training data** for Random Forest and finetuned BERT models.
- To validate quality, we **manually eyeballed 100 random samples** from the test set — the assigned categories were **highly accurate and consistent with expectations**.

---

### Evaluation Metrics

All models were evaluated using an **80/20 train–test split** with the following metrics:
- **Accuracy**
- **F1 Score (Weighted & Macro)**
- **Per-Class Precision/Recall**
- **Confusion Matrix** (exploratory, not shown here)

---

### Results

#### Random Forest

- **Accuracy**: `0.9860`
- **F1 Score (Weighted)**: `0.9825`
- **Macro Avg F1**: `0.58`  
- Strong on high-frequency classes like `Transfers`, but struggled with underrepresented ones like `Bills`, `Insurance`, and `Transport`.

#### Fine-Tuned BERT

- **Accuracy**: `1.00`
- **F1 Score (Weighted)**: `1.00`
- **Macro Avg F1**: `1.00`  
- BERT generalized well to all categories, even those with fewer training examples (e.g., `Loans`, `Services`).

---

### Conversational Assistant (LLM)

To evaluate our **fine-tuned Mistral 7B model** (trained on FiQA) vs. the **base Mistral**, we used an **LLM-as-a-Judge** framework.

---

### Evaluation Methodology

- We collected **50 real-world financial questions** (e.g., "How does a treasury bond work?", "What is a Roth IRA?").
- Both the base and fine-tuned models answered each question using **identical prompts**.
- We then used **GPT-4 as an unbiased evaluator** to score the responses blindly.

#### Scoring Criteria (scale: 1–5)

| Criterion      | Description                                      |
|----------------|--------------------------------------------------|
| **Clarity**    | Is the response well-structured and readable?    |
| **Accuracy**   | Is the information factually correct?            |
| **Helpfulness**| Does it fully address the user’s question?       |
| **Relevance**  | Is it specific to the financial context?         |

#### Results Summary (Average Across 50 Samples)

| Model                  | Clarity | Accuracy | Helpfulness | Relevance | Avg Score |
|------------------------|---------|----------|-------------|-----------|-----------|
| **Base Mistral 7B**    | 3.5     | 3.8      | 3.6         | 3.7       | 3.65      |
| **Fine-Tuned Mistral** | 4.8     | 4.9      | 4.7         | 4.9       | **4.83**  |

> The fine-tuned model produced **more precise, natural, and domain-specific answers**, making it significantly more useful in financial conversations.

---

### Final Model Selection

| Use Case                  | Final Model            | Justification                                       |
|---------------------------|------------------------|-----------------------------------------------------|
| Statement Categorization  | Fine-Tuned BERT        | Best macro and per-class performance                |
| Conversational Assistant  | Fine-Tuned Mistral (LoRA) | Outperformed base model in all qualitative metrics |

### Comparison to Naive Approach

As required, we implemented a **naive baseline** using **keyword-based matching** to assign transaction categories. This method simply checks for the presence of category-specific keywords (e.g., "uber" → Transport, "amazon" → Shopping) in the transaction description.

### Why a Naive Model?

- Very fast, lightweight, and requires no training
- Works well for common transactions with obvious keywords
- Struggles with ambiguous, rare, or context-dependent phrases (e.g., "Grocery King" vs "King Cafe")

---

### Comparison Summary

| Metric                  | Naive Model   | Random Forest   | Fine-Tuned BERT |
|-------------------------|---------------|------------------|------------------|
| Accuracy                | ~70%          | **98.6%**        | **100%**         |
| Macro F1 Score          | ~0.55         | 0.58             | **1.00**         |
| Handles rare classes    | No          | Somewhat      | Yes           |
| Handles context/phrasing| No          | Limited       | Yes           |
| Requires training       | No          | Yes           | Yes           |
| Hosting complexity      |Minimal     | Medium         | High          |

> The naive model was useful as a free-tier option, and worked decently (~70% accuracy) on easy, high-frequency categories.  
> However, it **failed to generalize** beyond literal keyword matches, especially for:
- Non-obvious merchant names (e.g., “Reliance Retail”)
- Multi-meaning phrases (“King” could be food or shopping)
- Vague or shortened descriptions

---

## Project Structure 

```bash
FinWise/
├── app/                                # Next.js App Directory
│   ├── api/                            # API Routes (Edge Functions)
│   │   ├── categorize/route.ts         # POST /api/categorize → categorization logic
│   │   ├── chat/route.ts               # POST /api/chat → chatbot relay to RunPod
│   │   └── process-statement/route.ts  # POST /api/process-statement → parses CSV
│   ├── statement-analysis/             # UI route for statement upload & view
│   │   └── page.tsx
│   ├── globals.css                     # Global styles
│   ├── layout.tsx                      # Layout wrapper for all pages
│   └── page.tsx                        # Root (chat) page
│
├── components/
│   ├── statement-analysis/             # Modular components for CSV workflow
│   │   ├── column-mapper.tsx
│   │   ├── file-uploader.tsx
│   │   ├── statement-analysis-page.tsx
│   │   └── transaction-table.tsx
│   └── ui/
│       ├── chat-interface.tsx          # Chat UI component
│       └── theme-provider.tsx          # Theme management for dark/light
│
├── deploy_finetuned_mistral/           # RunPod-hosted LLM server
│   ├── finetune-sloth-mistral.py       # Script to fine-tune Mistral with Unsloth
│   └── runpod_main.py                  # FastAPI app for /v1/chat/completions
│
├── hooks/
│   ├── use-mobile.tsx                  # Custom hook for mobile screen detection
│   └── use-toast.ts                    # Toast alert logic
│
├── lib/
│   └── utils.ts                        # Shared utilities
│
├── public/                             # Static assets for frontend
│   ├── placeholder-logo.png/svg
│   ├── placeholder-user.jpg
│   └── placeholder.jpg/svg
│
├── python/                             # (Optional/legacy) Python support if needed
├── scripts/
│   └── categorize.py                   # Naive categorizer + rule definition
│
├── styles/
│   └── globals.css                     # Tailwind + custom styling

# Root configs and metadata
├── components.json                     # AI-generated UI layout schema (optional)
├── LICENSE
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── requirements.txt                   # Python deps (RunPod)
├── tailwind.config.ts
└── tsconfig.json

```

---
## Ethics-Statement

- No personal data is stored or tracked by FinWise
- The chatbot does not log queries or responses
- We recommend users **do not upload sensitive information** — anonymize CSVs if needed
- All model outputs are **informational, not financial advice**

---

## Conclusion

Building FinWise was both technically challenging and deeply rewarding. It pushed me to explore the full stack of machine learning — from data cleaning and modeling to fine-tuning large language models and deploying them in a real-world application. I gained hands-on experience with everything from classical ML to modern transformer-based architectures, and learned how to make trade-offs between performance, cost, and deployability. Most importantly, this project showed me how AI can be used not just for automation, but for empowerment — helping people make smarter, more informed decisions about their finances.

---

## Future Work

- **Voice call interface** with ElevenLabs conversational agent
- More advanced analytics: monthly trends, saving insights, goals
- Integration with real bank APIs (e.g. Plaid) for live syncing
- Memory + conversation context support
- Pro account + authentication layer

---

## Final Demo (Link)

> Available on [YouTube](https://youtu.be/45Ml2Kxd6RE?si=joz-5LR34-V0tpCs)

---

Built with care by the FinWise team (That's Only Me) 

