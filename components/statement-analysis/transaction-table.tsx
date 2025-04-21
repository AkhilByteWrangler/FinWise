"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, Save, X, PieChart, Loader2, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  category: string
}

interface TransactionTableProps {
  transactions: Transaction[]
  onUpdateTransaction: (transaction: Transaction) => void
  onDeleteTransaction: (id: string) => void
  onCategorizeAll: (mode: "naive" | "ml") => Promise<void>
  categorizationMode: "naive" | "ml"
  isProcessing: boolean
}

export default function TransactionTable({
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  onCategorizeAll,
  categorizationMode,
  isProcessing,
}: TransactionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Transaction | null>(null)
  const [showStats, setShowStats] = useState(false)

  const categories = [
    "Uncategorized",
    "Shopping",
    "Food & Dining",
    "Transportation",
    "Health & Fitness",
    "Bills & Utilities",
    "Entertainment",
    "Electronics & Technology",
    "Restaurants",
    "Groceries",
    "Ride Sharing",
    "Automotive",
    "Health & Wellness",
    "Utilities",
    "Miscellaneous",
    "Education",
    "Personal Care",
    "Home",
    "Insurance",
    "Investments",
    "Income",
    "Transfers",
    "Subscriptions",
    "Travel",
  ]

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setEditForm({ ...transaction })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateTransaction(editForm)
      setEditingId(null)
      setEditForm(null)
    }
  }

  const handleInputChange = (field: keyof Transaction, value: string | number) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value,
      })
    }
  }

  // Calculate category statistics
  const getCategoryStats = () => {
    const stats: Record<string, { count: number; total: number }> = {}

    transactions.forEach((transaction) => {
      const category = transaction.category || "Uncategorized"

      if (!stats[category]) {
        stats[category] = { count: 0, total: 0 }
      }

      stats[category].count += 1
      stats[category].total += transaction.amount
    })

    return Object.entries(stats)
      .map(([category, data]) => ({
        category,
        count: data.count,
        total: data.total,
        percentage: (data.total / transactions.reduce((sum, t) => sum + t.amount, 0)) * 100,
      }))
      .sort((a, b) => b.total - a.total)
  }

  const categoryStats = getCategoryStats()

  // Generate consistent colors for categories
  const getCategoryColor = (category: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500",
      "bg-violet-500",
    ]

    // Simple hash function to consistently assign colors to categories
    const hash = category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium">Transactions</h3>
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onCategorizeAll(categorizationMode)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Categorizing...
                    </>
                  ) : (
                    <>
                      Categorize All
                      <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
                        {categorizationMode === "ml" ? "Pro" : "Basic"}
                      </span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {categorizationMode === "ml"
                    ? "Pro mode uses AI to analyze transaction descriptions and provide more accurate categorization."
                    : "Basic mode uses keyword matching to categorize transactions."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" onClick={() => setShowStats(!showStats)} className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            {showStats ? "Hide Statistics" : "Show Statistics"}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Categorization Mode
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Choose between basic keyword matching or advanced AI categorization.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            {categorizationMode === "ml"
              ? "Pro mode uses our financial AI to analyze transaction descriptions and provide more accurate categorization."
              : "Basic mode uses keyword matching to categorize transactions based on common merchant names and terms."}
          </CardDescription>
        </CardHeader>
      </Card>

      {showStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(stat.category)}`}></div>
                      <span className="font-medium">{stat.category}</span>
                    </div>
                    <span className="font-medium">${stat.total.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`${getCategoryColor(stat.category)} h-2 rounded-full`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{stat.count} transactions</span>
                    <span>{stat.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {editingId === transaction.id ? (
                      <Input
                        value={editForm?.date || ""}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      transaction.date
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === transaction.id ? (
                      <Input
                        value={editForm?.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      transaction.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === transaction.id ? (
                      <Input
                        type="number"
                        value={editForm?.amount || 0}
                        onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value))}
                        className="w-full"
                        step="0.01"
                      />
                    ) : (
                      `$${Math.abs(transaction.amount).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === transaction.id ? (
                      <Select
                        value={editForm?.category || "Uncategorized"}
                        onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        {transaction.category ? (
                          <>
                            <div className={`w-2 h-2 rounded-full ${getCategoryColor(transaction.category)}`}></div>
                            {transaction.category}
                          </>
                        ) : (
                          <span className="text-slate-400">Uncategorized</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === transaction.id ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(transaction)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <p>Are you sure you want to delete this transaction?</p>
                              <p className="text-sm text-slate-500 mt-2">
                                {transaction.description} - ${Math.abs(transaction.amount).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Cancel</Button>
                              <Button
                                onClick={() => onDeleteTransaction(transaction.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
