import { db } from './database'
import type { BudgetItem } from './models'

export async function setBudget(month: string, amount: number): Promise<number> {
  const existing = await db.budgets.where('month').equals(month).first()
  if (existing && existing.id) {
    await db.budgets.update(existing.id, { amount })
    return existing.id
  }
  return db.budgets.add({ month, amount })
}

export async function getBudget(month: string): Promise<BudgetItem | undefined> {
  return db.budgets.where('month').equals(month).first()
}
