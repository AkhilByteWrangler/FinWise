"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface ColumnMapperProps {
  fileData: any
  onColumnMapping: (mappedColumns: { date: string; description: string; amount: string; processedData: any[] }) => void
}

export default function ColumnMapper({ fileData, onColumnMapping }: ColumnMapperProps) {
  const [dateColumn, setDateColumn] = useState<string>("")
  const [descriptionColumn, setDescriptionColumn] = useState<string>("")
  const [amountColumn, setAmountColumn] = useState<string>("")
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!fileData) return

    setIsLoading(true)

    try {
      // CSV data is already structured
      const columns = fileData.data.headers
      const preview = fileData.data.rows.slice(0, 5)

      // Try to auto-detect columns
      autoDetectColumns(columns, preview)

      setAvailableColumns(columns)
      setPreviewData(preview)
    } catch (error) {
      console.error("Error processing file data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [fileData])

  // Try to auto-detect column mappings based on common patterns
  const autoDetectColumns = (columns: string[], data: any[]) => {
    // Try to detect date column
    const dateRegex = /date|time|when/i
    const dateColumn = columns.find((col) => dateRegex.test(col))
    if (dateColumn) setDateColumn(dateColumn)

    // Try to detect description column
    const descRegex = /desc|narration|details|merchant|payee|transaction|particulars/i
    const descColumn = columns.find((col) => descRegex.test(col))
    if (descColumn) setDescriptionColumn(descColumn)

    // Try to detect amount column
    const amountRegex = /amount|sum|value|debit|credit|payment/i
    const amountColumn = columns.find((col) => amountRegex.test(col))
    if (amountColumn) setAmountColumn(amountColumn)
  }

  const handleConfirm = () => {
    if (!dateColumn || !descriptionColumn || !amountColumn) {
      alert("Please map all required columns")
      return
    }

    // Process the data with the mapped columns
    const processedData = processDataWithMapping(fileData.data.rows)

    onColumnMapping({
      date: dateColumn,
      description: descriptionColumn,
      amount: amountColumn,
      processedData,
    })
  }

  // Convert the raw data to our transaction format based on column mapping
  const processDataWithMapping = (rows: any[]) => {
    // Convert the data based on the column mapping
    return rows
      .map((row, index) => {
        // Extract values from the row
        const dateValue = row[dateColumn]
        const descValue = row[descriptionColumn]
        let amountValue = row[amountColumn]

        // Clean and convert amount to number
        if (typeof amountValue === "string") {
          // Remove currency symbols, commas, etc.
          amountValue = amountValue.replace(/[^\d.-]/g, "")
          amountValue = Number.parseFloat(amountValue) || 0
        }

        return {
          id: `tx-${index}`,
          date: formatDate(dateValue),
          description: descValue,
          amount: amountValue,
          category: "",
        }
      })
      .filter((tx) => tx.description && tx.amount !== 0) // Filter out invalid entries
  }

  // Try to format dates in a consistent way
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""

    // Try to parse various date formats
    let date: Date

    // Check if it's already in ISO format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.substring(0, 10)
    }

    // Try MM/DD/YYYY or DD/MM/YYYY
    const parts = dateStr.split(/[/.-]/)
    if (parts.length === 3) {
      // Assume MM/DD/YYYY for US format
      const month = Number.parseInt(parts[0])
      const day = Number.parseInt(parts[1])
      let year = Number.parseInt(parts[2])

      // Add century if needed
      if (year < 100) {
        year += year < 50 ? 2000 : 1900
      }

      date = new Date(year, month - 1, day)
      return date.toISOString().substring(0, 10)
    }

    // Try to parse with Date constructor as fallback
    try {
      date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return date.toISOString().substring(0, 10)
      }
    } catch (e) {
      // If all else fails, return the original string
      return dateStr
    }

    return dateStr
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-600">Analyzing file structure...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Map Columns from {fileData?.fileName}</h3>
        <p className="text-sm text-slate-500 mb-6">
          Please map the columns from your statement to the required fields for analysis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Column</label>
            <Select value={dateColumn} onValueChange={setDateColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select date column" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description Column</label>
            <Select value={descriptionColumn} onValueChange={setDescriptionColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select description column" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount Column</label>
            <Select value={amountColumn} onValueChange={setAmountColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select amount column" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Data Preview</h4>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {availableColumns.map((column) => (
                  <TableHead key={column} className="bg-slate-50">
                    {column}
                    {column === dateColumn && <span className="ml-2 text-xs text-emerald-600">(Date)</span>}
                    {column === descriptionColumn && (
                      <span className="ml-2 text-xs text-emerald-600">(Description)</span>
                    )}
                    {column === amountColumn && <span className="ml-2 text-xs text-emerald-600">(Amount)</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, index) => (
                <TableRow key={index}>
                  {availableColumns.map((column) => (
                    <TableCell key={column}>{row[column]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleConfirm}
          disabled={!dateColumn || !descriptionColumn || !amountColumn}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Confirm Mapping
        </Button>
      </div>
    </div>
  )
}
