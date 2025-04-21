// Statement Analysis Page Component
// Handles the workflow for analyzing credit card statements:
// 1. File upload
// 2. Column mapping
// 3. Transaction analysis and categorization
// Author: FinWise Team
// Last updated: April 2025

"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import FileUploader from "@/components/statement-analysis/file-uploader"
import ColumnMapper from "@/components/statement-analysis/column-mapper"
import TransactionTable from "@/components/statement-analysis/transaction-table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, AlertCircle, Sparkles, Search } from "lucide-react"
import Link from "next/link"

// Type definitions for our data structures
type FileData = {
  fileName: string
  fileType: "pdf" | "csv"
  data: any
}

type MappedColumns = {
  date: string
  description: string
  amount: string
  processedData: Transaction[]
}

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  category: string
}

type CategorizationMode = "naive" | "ml"

export default function StatementAnalysisPage() {
  // State for the multi-step workflow
  const [currentStep, setCurrentStep] = useState<"upload" | "map" | "analyze">("upload")
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [mappedColumns, setMappedColumns] = useState<MappedColumns | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categorizationMode, setCategorizationMode] = useState<CategorizationMode>("naive")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle file upload completion
  const handleFileUpload = (data: any) => {
    setFileData({
      fileName: data.fileName,
      fileType: data.fileType,
      data: data.data,
    })

    // Move to the column mapping step
    setCurrentStep("map")
  }

  // Handle column mapping completion
  const handleColumnMapping = (columns: MappedColumns) => {
    setMappedColumns(columns)
    setTransactions(columns.processedData)

    // Move to the analysis step
    setCurrentStep("analyze")
  }

  // Update a single transaction (from edit)
  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
  }

  // Delete a transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  // Categorize all transactions using the selected mode
  const handleCategorizeAll = async (mode: CategorizationMode) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Call our categorization API
      const response = await fetch("/api/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions,
          mode,
        }),
      })

      // Validate response
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please try again later.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      // Update transactions with categories
      const data = await response.json()
      setTransactions(data.transactions)
    } catch (error) {
      console.error("Error categorizing transactions:", error)
      setError(error.message || "Error categorizing transactions. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return <FileUploader onFileUpload={handleFileUpload} />
      case "map":
        return <ColumnMapper fileData={fileData} onColumnMapping={handleColumnMapping} />
      case "analyze":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-medium">Transaction Analysis</h3>
                <p className="text-sm text-slate-500">
                  {transactions.length} transactions from {fileData?.fileName}
                </p>
              </div>

              {/* Categorization mode selector */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Tabs
                  defaultValue="naive"
                  value={categorizationMode}
                  className="w-full sm:w-auto"
                  onValueChange={(value) => setCategorizationMode(value as CategorizationMode)}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="naive" className="flex items-center gap-1">
                      <Search className="h-3.5 w-3.5" />
                      Basic Mode
                      <Badge className="ml-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Free</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="ml" className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Pro Mode
                      <Badge className="ml-1 bg-amber-100 text-amber-800 hover:bg-amber-100">Pro</Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Transaction table with categorization */}
            <TransactionTable
              transactions={transactions}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onCategorizeAll={handleCategorizeAll}
              categorizationMode={categorizationMode}
              isProcessing={isProcessing}
            />
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-emerald-600 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Financial Assistant
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <FileText size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Statement Analysis</h1>
        </div>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Upload your credit card statements to analyze and categorize your transactions. Gain insights into your
          spending patterns and take control of your finances.
        </p>

        {/* Privacy statement for statement analysis */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Data Privacy & Ethics Statement</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your privacy is our priority. When you upload financial statements, all processing occurs locally in your
            browser. We do not store your files or extracted transaction data on our servers. The data is only used for
            analysis during your current session and is cleared when you leave the page. Please redact or remove any
            sensitive personal information (account numbers, SSN, etc.) before uploading documents. Our categorization
            features use privacy-preserving techniques to analyze transaction patterns without compromising your
            financial privacy.
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center max-w-2xl mx-auto">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep === "upload"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : currentStep === "map" || currentStep === "analyze"
                  ? "border-emerald-600 bg-emerald-100 text-emerald-600"
                  : "border-slate-300 bg-slate-100 text-slate-500"
            }`}
          >
            1
          </div>
          <div
            className={`h-1 w-24 sm:w-32 md:w-40 ${
              currentStep === "map" || currentStep === "analyze" ? "bg-emerald-600" : "bg-slate-200"
            }`}
          ></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep === "map"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : currentStep === "analyze"
                  ? "border-emerald-600 bg-emerald-100 text-emerald-600"
                  : "border-slate-300 bg-slate-100 text-slate-500"
            }`}
          >
            2
          </div>
          <div
            className={`h-1 w-24 sm:w-32 md:w-40 ${currentStep === "analyze" ? "bg-emerald-600" : "bg-slate-200"}`}
          ></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep === "analyze"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-slate-100 text-slate-500"
            }`}
          >
            3
          </div>
        </div>
        <div className="flex justify-center max-w-2xl mx-auto mt-2 text-sm">
          <div className="flex-1 text-center">Upload</div>
          <div className="flex-1 text-center">Map Columns</div>
          <div className="flex-1 text-center">Analyze</div>
        </div>
      </div>

      {/* Main content card */}
      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>
    </div>
  )
}
