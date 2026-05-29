export interface RecordItem {
  id?: number
  amount: number
  category: string
  date: string // YYYY-MM-DD
  type: 'expense' | 'income'
  note: string
  createdAt: number // timestamp
}

export interface BudgetItem {
  id?: number
  month: string // YYYY-MM
  amount: number
}
