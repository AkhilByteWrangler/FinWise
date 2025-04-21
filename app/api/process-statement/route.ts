// Statement Processing API
// Handles CSV file uploads for credit card statements
// Extracts transaction data for analysis
// Author: FinWise Team
// Last updated: April 2025

import { NextResponse } from "next/server"
import { parse as csvParse } from "csv-parse/sync"

export async function POST(request: Request) {
  try {
    // Get the uploaded file from form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if file is CSV
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith(".csv")) {
      return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 })
    }

    // Convert to buffer and process
    const buffer = Buffer.from(await file.arrayBuffer())
    const extractedData = await processCsvFile(buffer)

    // Return the extracted data
    return NextResponse.json({
      fileType: "csv",
      fileName: file.name,
      data: extractedData,
    })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json(
      { error: "Failed to process file: " + (error.message || "Unknown error") },
      { status: 500 },
    )
  }
}

/**
 * Process CSV file to extract transaction data
 * Uses csv-parse to parse the CSV content
 */
async function processCsvFile(buffer: Buffer) {
  try {
    // Parse CSV data
    const content = buffer.toString("utf-8")
    const records = csvParse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Extract headers and rows
    const headers = records.length > 0 ? Object.keys(records[0]) : []

    return {
      headers,
      rows: records,
    }
  } catch (error) {
    console.error("Error processing CSV:", error)
    throw new Error("Failed to process CSV: " + (error.message || "Unknown error"))
  }
}
