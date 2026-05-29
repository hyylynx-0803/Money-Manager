import { create } from 'zustand'
import type { RecordItem } from '@/db/models'
import * as recordDb from '@/db/records'
import * as budgetDb from '@/db/budget'

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface RecordStore {
  // Data
  records: RecordItem[]
  monthlyStats: {
    totalExpense: number
    totalIncome: number
    categoryBreakdown: Record<string, number>
  }
  budget: number | null

  // UI state
  loading: boolean
  searchKeyword: string
  filterType: 'all' | 'expense' | 'income'
  filterCategory: string
  editingRecord: RecordItem | null

  // Actions
  loadRecords: (yearMonth?: string) => Promise<void>
  searchRecords: (keyword: string) => Promise<void>
  setFilter: (type: 'all' | 'expense' | 'income', category?: string) => void
  addRecord: (item: Omit<RecordItem, 'id' | 'createdAt'>) => Promise<number>
  updateRecord: (id: number, item: Partial<Omit<RecordItem, 'id' | 'createdAt'>>) => Promise<void>
  deleteRecord: (id: number) => Promise<void>
  setEditingRecord: (record: RecordItem | null) => void
  loadBudget: () => Promise<void>
  setBudget: (amount: number) => Promise<void>
}

export const useRecordStore = create<RecordStore>((set, get) => ({
  records: [],
  monthlyStats: { totalExpense: 0, totalIncome: 0, categoryBreakdown: {} },
  budget: null,
  loading: false,
  searchKeyword: '',
  filterType: 'all',
  filterCategory: '',
  editingRecord: null,

  async loadRecords(yearMonth) {
    set({ loading: true })
    const month = yearMonth || currentMonth()
    const [records, stats, budget] = await Promise.all([
      recordDb.getRecordsByMonth(month),
      recordDb.getMonthlyStats(month),
      budgetDb.getBudget(month),
    ])
    set({
      records,
      monthlyStats: stats,
      budget: budget?.amount ?? null,
      loading: false,
    })
  },

  async searchRecords(keyword: string) {
    set({ searchKeyword: keyword, loading: true })
    if (!keyword.trim()) {
      get().loadRecords()
      return
    }
    const records = await recordDb.searchRecords(keyword)
    set({ records, loading: false })
  },

  setFilter(type, category = '') {
    set({ filterType: type, filterCategory: category })
  },

  async addRecord(item) {
    const id = await recordDb.addRecord(item)
    await get().loadRecords()
    return id
  },

  async updateRecord(id, item) {
    await recordDb.updateRecord(id, item)
    set({ editingRecord: null })
    await get().loadRecords()
  },

  async deleteRecord(id) {
    await recordDb.deleteRecord(id)
    await get().loadRecords()
  },

  setEditingRecord(record) {
    set({ editingRecord: record })
  },

  async loadBudget() {
    const b = await budgetDb.getBudget(currentMonth())
    set({ budget: b?.amount ?? null })
  },

  async setBudget(amount: number) {
    await budgetDb.setBudget(currentMonth(), amount)
    set({ budget: amount })
  },
}))
