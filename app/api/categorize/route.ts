// Transaction categorization API endpoint
// Offers two modes:
// 1. Naive (free): basic keyword-based categories
// 2. Pro (LLM): smarter, bulk categorization using AI

import { NextResponse } from "next/server"

/**
 * Handles incoming POST requests with transaction data
 * Categorizes each transaction based on the selected mode
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactions, mode } = body

    // Validate transactions array
    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Invalid transactions data" }, { status: 400 })
    }

    if (mode === "naive") {
      // Free version: match description with keywords
      const categorizedTransactions = transactions.map((transaction) => {
        return {
          ...transaction,
          category: categorizeWithKeywords(transaction.description),
        }
      })

      return NextResponse.json({ transactions: categorizedTransactions })
    } else {
      // Pro version: send to LLM for smarter categorization
      const categorizedTransactions = await categorizeWithLLM(transactions)
      return NextResponse.json({ transactions: categorizedTransactions })
    }
  } catch (error) {
    console.error("Error in categorize API route:", error)
    return NextResponse.json(
      { error: "Failed to process request: " + (error.message || "Unknown error") },
      { status: 500 },
    )
  }
}

/**
 * Naively categorizes a description using keyword matching
 * Works well for common merchants and terms
 */
function categorizeWithKeywords(description: string) {
  const desc = description.toLowerCase()

  // Keywords grouped by category
  const categories = {
    Shopping: ["amazon", "walmart", "target", "ebay", "etsy", "bestbuy", "purchase", "shop"],
    "Food & Dining": [
      "restaurant", "cafe", "coffee", "starbucks", "mcdonald", "burger", "pizza", "food", "dining", "chipotle", "subway", "taco", "wendy",
    ],
    Groceries: [
      "grocery", "supermarket", "market", "trader", "whole foods", "safeway", "kroger", "aldi", "publix", "food",
    ],
    Transportation: ["uber", "lyft", "taxi", "cab", "transit", "metro", "subway", "bus", "train", "transport"],
    Travel: ["hotel", "airbnb", "airline", "flight", "booking", "expedia", "travel", "vacation", "trip"],
    Entertainment: ["netflix", "hulu", "spotify", "disney", "movie", "theater", "concert", "ticket", "entertainment"],
    "Health & Fitness": ["gym", "fitness", "workout", "exercise", "health", "medical", "doctor", "pharmacy", "drug", "cvs", "walgreens"],
    "Bills & Utilities": ["bill", "utility", "electric", "water", "gas", "internet", "phone", "cable", "service"],
    Education: ["tuition", "school", "college", "university", "course", "class", "education", "book", "textbook"],
    "Personal Care": ["salon", "spa", "haircut", "beauty", "cosmetic", "personal care"],
    Home: ["furniture", "home depot", "lowes", "ikea", "home", "house", "apartment", "rent", "mortgage"],
    Insurance: ["insurance", "premium", "coverage", "policy"],
    Investments: ["investment", "stock", "bond", "mutual fund", "etf", "brokerage", "dividend", "capital"],
    Income: ["salary", "paycheck", "deposit", "income", "revenue", "wage", "earnings", "commission"],
    Transfers: ["transfer", "zelle", "venmo", "paypal", "cash app", "wire", "ach", "direct deposit"],
    Subscriptions: ["subscription", "membership", "recurring", "monthly", "annual"],
  }

  // Match first keyword found in any category
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        return category
      }
    }
  }

  return "Uncategorized"
}

/**
 * Uses the financial LLM to categorize transactions more intelligently
 * Processes in batches to handle large input sizes
 */
async function categorizeWithLLM(transactions: any[]) {
  const batchSize = 10
  const batches = []

  // Chunk transactions into batches
  for (let i = 0; i < transactions.length; i += batchSize) {
    batches.push(transactions.slice(i, i + batchSize))
  }

  // Categorize each batch in parallel
  const categorizedBatches = await Promise.all(
    batches.map(async (batch) => {
      return processBatchWithLLM(batch)
    }),
  )

  return categorizedBatches.flat()
}

/**
 * Sends a batch to the LLM, parses its response, and handles fallback if needed
 */
async function processBatchWithLLM(batch: any[]) {
  const transactionsText = batch
    .map((t) => `Transaction: ${t.description}, Amount: ${Math.abs(t.amount).toFixed(2)}`)
    .join("\n")

  const prompt = `
You are a financial transaction categorizer. Please categorize each transaction into one of the following categories:
- Shopping
- Food & Dining
- Groceries
- Transportation
- Travel
- Entertainment
- Health & Fitness
- Bills & Utilities
- Education
- Personal Care
- Home
- Insurance
- Investments
- Income
- Transfers
- Subscriptions
- Miscellaneous

For each transaction, respond with ONLY the category name, one per line, in the same order as the transactions.

Here are the transactions:
${transactionsText}
`

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message.content

    // Split LLM output into individual categories
    const categories = assistantMessage
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => line.trim())

    // If mismatch in count, fall back to keyword method
    if (categories.length !== batch.length) {

      return batch.map((transaction) => ({
        ...transaction,
        category: categorizeWithKeywords(transaction.description),
      }))
    }

    // Map categories to original transactions
    return batch.map((transaction, index) => ({
      ...transaction,
      category: categories[index] || "Miscellaneous",
    }))
  } catch (error) {
    console.error("Error calling LLM:", error)

    // LLM failed — fallback to basic categorization
    return batch.map((transaction) => ({
      ...transaction,
      category: categorizeWithKeywords(transaction.description),
    }))
  }
}
