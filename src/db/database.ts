import Dexie, { type Table } from 'dexie'
import type { RecordItem, BudgetItem } from './models'

class AppDatabase extends Dexie {
  records!: Table<RecordItem, number>
  budgets!: Table<BudgetItem, number>

  constructor() {
    super('JiaZhangApp')

    this.version(1).stores({
      records: '++id, date, category, type',
      budgets: '++id, &month',
    })
  }
}

export const db = new AppDatabase()
