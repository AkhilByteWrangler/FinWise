// File Uploader Component for Statement Analysis
// Handles drag-and-drop and file selection for CSV statements
// Includes validation, error handling, and file processing
// Author: FinWise Team
// Last updated: April 2025

"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileUp, FileSpreadsheet, Loader2 } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (fileData: any) => void
}

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  // State for drag-and-drop and file handling
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFile(file)
    }
  }

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      handleFile(file)
    }
  }

  // Process and validate the selected file
  const handleFile = (file: File) => {
    // Check if file is CSV
    const fileType = file.name.toLowerCase()
    if (!fileType.endsWith(".csv")) {
      setUploadError("Please upload a CSV file")
      return
    }

    setSelectedFile(file)
    setUploadError(null)
  }

  // Upload and process the file
  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Send to our processing API
      const response = await fetch("/api/process-statement", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process file")
      }

      // Pass the processed data up to parent
      const data = await response.json()
      onFileUpload(data)
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadError(error.message || "Error processing file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:border-emerald-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-slate-100 p-3">
            <FileUp className="h-8 w-8 text-slate-500" />
          </div>
          <div>
            <p className="text-lg font-medium">Drag and drop your statement file</p>
            <p className="text-sm text-slate-500">or click to browse files</p>
          </div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            Browse Files
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept=".csv" className="hidden" />
          <p className="text-xs text-slate-500">Supported format: CSV</p>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="mt-3 text-xs text-slate-500 p-3 bg-slate-50 rounded-md border border-slate-200">
        <p className="font-medium mb-1">Privacy Notice:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Files are processed locally in your browser</li>
          <li>We do not store your statements or transaction data</li>
          <li>Please redact sensitive information before uploading</li>
          <li>Data is cleared when you leave this page</li>
        </ul>
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{uploadError}</div>
      )}

      {/* Selected file info */}
      {selectedFile && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button onClick={handleUpload} disabled={isUploading} className="bg-emerald-600 hover:bg-emerald-700">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process File"
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
