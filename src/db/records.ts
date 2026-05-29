import { db } from './database'
import type { RecordItem } from './models'

export async function addRecord(item: Omit<RecordItem, 'id' | 'createdAt'>): Promise<number> {
  const record: Omit<RecordItem, 'id'> = {
    ...item,
    createdAt: Date.now(),
  }
  return db.records.add(record)
}

export async function updateRecord(id: number, item: Partial<Omit<RecordItem, 'id' | 'createdAt'>>): Promise<number> {
  return db.records.update(id, item)
}

export async function deleteRecord(id: number): Promise<void> {
  return db.records.delete(id)
}

export async function getRecord(id: number): Promise<RecordItem | undefined> {
  return db.records.get(id)
}

export async function getRecordsByDateRange(start: string, end: string): Promise<RecordItem[]> {
  return db.records
    .where('date')
    .between(start, end, true, true)
    .reverse()
    .sortBy('date')
}

export async function getRecordsByMonth(yearMonth: string): Promise<RecordItem[]> {
  const start = `${yearMonth}-01`
  // Get last day of month
  const [year, month] = yearMonth.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${yearMonth}-${String(lastDay).padStart(2, '0')}`
  return getRecordsByDateRange(start, end)
}

export async function searchRecords(keyword: string): Promise<RecordItem[]> {
  const all = await db.records.reverse().sortBy('date')
  const kw = keyword.toLowerCase()
  return all.filter(
    (r) =>
      r.note.toLowerCase().includes(kw) ||
      r.category.toLowerCase().includes(kw)
  )
}

export async function getAllRecords(): Promise<RecordItem[]> {
  return db.records.reverse().sortBy('date')
}

export async function getMonthlyStats(yearMonth: string): Promise<{
  totalExpense: number
  totalIncome: number
  categoryBreakdown: Record<string, number>
}> {
  const records = await getRecordsByMonth(yearMonth)
  let totalExpense = 0
  let totalIncome = 0
  const categoryBreakdown: Record<string, number> = {}

  for (const r of records) {
    if (r.type === 'expense') {
      totalExpense += r.amount
      categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + r.amount
    } else {
      totalIncome += r.amount
    }
  }

  return { totalExpense, totalIncome, categoryBreakdown }
}
