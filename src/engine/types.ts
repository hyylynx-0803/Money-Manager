export interface ParseResult {
  amount: number | null
  category: string
  date: string // YYYY-MM-DD
  type: 'expense' | 'income'
  note: string
  raw: string
  confidence: {
    amount: number
    category: number
    date: number
    type: number
  }
}
