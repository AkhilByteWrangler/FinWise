import type { Metadata } from "next"
import StatementAnalysisPage from "@/components/statement-analysis/statement-analysis-page"

export const metadata: Metadata = {
  title: "FinWise | Statement Analysis",
  description: "Upload and analyze your credit card statements with FinWise",
}

export default function StatementAnalysis() {
  return <StatementAnalysisPage />
}
