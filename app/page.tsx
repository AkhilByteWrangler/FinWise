// Main landing page for FinWise - our financial assistant app
// Displays the chat interface and provides navigation to statement analysis
// Author: FinWise Team
// Last updated: April 2025

import type { Metadata } from "next"
import ChatInterface from "@/components/chat-interface"
import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "FinWise | Your Financial Assistant",
  description: "Get expert financial advice and answers to your questions with FinWise AI assistant",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto flex flex-1 flex-col px-4 py-8">
        {/* Header with logo and navigation */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
            <h1 className="text-3xl font-bold text-slate-900">FinWise</h1>
          </div>

          {/* Link to statement analysis feature */}
          <Link
            href="/statement-analysis"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-600"
          >
            <FileText className="h-4 w-4" />
            Statement Analysis
          </Link>
        </header>

        {/* App description */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="mb-3 text-2xl font-bold text-slate-900">Your Personal Financial Assistant</h2>
          <p className="text-slate-600">
            Ask any financial question and get expert advice instantly. From investment strategies to understanding
            financial terms, FinWise is here to help.
          </p>
        </div>

        {/* Main chat interface component */}
        <div className="mx-auto w-full max-w-4xl flex-1">
          <ChatInterface />
        </div>

        {/* Privacy statement */}
        <div className="mt-8 mb-4 mx-auto max-w-2xl p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Our Commitment to Privacy & Ethics</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            FinWise is committed to transparency and ethical handling of your data. Our AI assistant processes your
            questions locally and does not store conversation history beyond your current session. We recommend avoiding
            sharing sensitive personal or financial information in your queries. Our goal is to provide helpful
            financial guidance while respecting your privacy and data sovereignty.
          </p>
        </div>

        {/* Footer with copyright and disclaimer */}
        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>© 2025 FinWise. All rights reserved.</p>
          <p className="mt-1">
            Financial information provided is for educational purposes only and should not be considered financial
            advice.
          </p>
        </footer>
      </div>
    </main>
  )
}
