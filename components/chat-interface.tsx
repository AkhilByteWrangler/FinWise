// Chat interface component for the FinWise financial assistant
// Handles user input, message display, and API communication
// Features: message history, loading states, suggested questions
// Author: FinWise Team
// Last updated: April 2025

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Send, DollarSign, TrendingUp, PieChart, HelpCircle } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

type SuggestedQuestion = {
  text: string
  icon: React.ReactNode
}

export default function ChatInterface() {
  // State for messages, input field, and loading status
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your FinWise assistant. How can I help with your financial questions today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Predefined questions to help users get started
  const suggestedQuestions: SuggestedQuestion[] = [
    { text: "What is a treasury bond?", icon: <DollarSign className="h-4 w-4" /> },
    { text: "How do I start investing?", icon: <TrendingUp className="h-4 w-4" /> },
    { text: "Explain mutual funds", icon: <PieChart className="h-4 w-4" /> },
    { text: "What's the difference between stocks and bonds?", icon: <HelpCircle className="h-4 w-4" /> },
  ]

  // Auto-scroll to the bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Send message to API and handle response
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: message }])
    setIsLoading(true)

    try {
      // Call our financial AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage = data.choices[0].message.content

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }])
    } catch (error) {
      console.error("Error:", error)

      // Use fallback response if API is unavailable
      const fallbackResponse = getFallbackResponse(message)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackResponse,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Fallback responses for common questions when API is down
  const getFallbackResponse = (question: string) => {
    const fallbackResponses: Record<string, string> = {
      "What is a treasury bond?":
        "A Treasury bond is a long-term government debt security issued by the U.S. Department of the Treasury. These bonds have maturities ranging from 10 to 30 years and pay interest semi-annually. Treasury bonds are considered one of the safest investments as they're backed by the full faith and credit of the U.S. government.",

      "How do I start investing?":
        "To start investing: 1) Set clear financial goals, 2) Build an emergency fund first, 3) Pay off high-interest debt, 4) Determine your risk tolerance, 5) Research investment options (stocks, bonds, ETFs, mutual funds), 6) Consider opening an account with a reputable broker, 7) Start with a diversified portfolio, and 8) Consider consulting with a financial advisor for personalized advice.",

      "Explain mutual funds":
        "A mutual fund is an investment vehicle that pools money from many investors to purchase a diversified portfolio of stocks, bonds, or other securities. Professional fund managers handle the investments, making decisions on behalf of the investors. Mutual funds offer diversification, professional management, and liquidity, making them accessible to individual investors who might not have the time, expertise, or capital to build diversified portfolios on their own.",

      "What's the difference between stocks and bonds?":
        "Stocks represent ownership in a company, while bonds represent loans made to a company or government. When you buy stocks, you become a partial owner and may receive dividends and benefit from price appreciation. Stocks generally offer higher potential returns but come with higher risk. Bonds, on the other hand, pay regular interest and return the principal at maturity. They typically offer lower returns but with less risk and more predictable income.",
    }

    // Check if we have a specific response for this question
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (question.toLowerCase().includes(key.toLowerCase())) {
        return response
      }
    }

    // Default fallback response
    return "I can provide information about various financial topics like investments, savings, retirement planning, and more. Could you please try asking a different financial question?"
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSendMessage(input)
    setInput("")
  }

  // Handle clicking on a suggested question
  const handleSuggestedQuestion = async (question: string) => {
    setInput("")
    await handleSendMessage(question)
  }

  return (
    <div className="flex flex-1 flex-col">
      <Card className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        {/* Message display area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6a4 4 0 0 0-4-4 7 7 0 0 0-7 7c0 4 3 6 4 8 2 2 3 3 3 5" />
                      <path d="M18 11v5" />
                      <path d="M15 18h6" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6a4 4 0 0 0-4-4 7 7 0 0 0-7 7c0 4 3 6 4 8 2 2 3 3 3 5" />
                    <path d="M18 11v5" />
                    <path d="M15 18h6" />
                  </svg>
                </div>
                <div className="flex max-w-[80%] items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-slate-800">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested questions (only shown at the start) */}
        {messages.length === 1 && !isLoading && (
          <>
            <div className="mx-4 mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question.text)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-600"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    {question.icon}
                  </span>
                  <span className="line-clamp-1">{question.text}</span>
                </button>
              ))}
            </div>
            <div className="mx-4 mb-4 p-3 bg-slate-50 rounded-md border border-slate-200">
              <p className="text-xs text-slate-500">
                <span className="font-medium">Privacy Note:</span> Our AI assistant processes your questions locally. We
                recommend avoiding sharing sensitive personal or financial details in your queries.
              </p>
            </div>
          </>
        )}

        {/* Input area */}
        <div className="border-t border-slate-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a financial question..."
              className="min-h-[60px] flex-1 resize-none rounded-xl border-slate-200 focus-visible:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-auto rounded-xl bg-emerald-600 px-4 hover:bg-emerald-700"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
