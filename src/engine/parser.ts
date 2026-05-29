import type { ParseResult } from './types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './categories'

const dayNames = ['日', '天', '一', '二', '三', '四', '五', '六', '七']

// ── Time extraction ──

function extractDate(text: string): { date: string; confidence: number } {
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth() + 1
  const d = today.getDate()

  const fmt = (year: number, month: number, day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // X月X号 / X月X日
  const mthDay = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[号日]/)
  if (mthDay) {
    const mm = parseInt(mthDay[1], 10)
    const dd = parseInt(mthDay[2], 10)
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return { date: fmt(y, mm, dd), confidence: 1 }
    }
  }

  // X号 / X日 (无月份，默认当月)
  const dayOnly = text.match(/(\d{1,2})\s*[号日]/)
  if (dayOnly) {
    const dd = parseInt(dayOnly[1], 10)
    if (dd >= 1 && dd <= 31) {
      return { date: fmt(y, m, dd), confidence: 0.9 }
    }
  }

  // 上周X
  const lastWeek = text.match(/上周\s*([一二三四五六七天日])/)
  if (lastWeek) {
    const idx = dayNames.indexOf(lastWeek[1])
    if (idx >= 0) {
      const dayOfWeek = idx === 0 || idx === 1 ? 7 : idx - 1
      const offset = (today.getDay() || 7) - dayOfWeek + 7
      const target = new Date(today)
      target.setDate(today.getDate() - offset)
      return { date: fmt(target.getFullYear(), target.getMonth() + 1, target.getDate()), confidence: 0.95 }
    }
  }

  // 周X / 星期X
  const thisWeek = text.match(/(?:周|星期)\s*([一二三四五六七天日])/)
  if (thisWeek) {
    const idx = dayNames.indexOf(thisWeek[1])
    if (idx >= 0) {
      const dayOfWeek = idx === 0 || idx === 1 ? 7 : idx - 1
      const todayDow = today.getDay() || 7
      const offset = todayDow - dayOfWeek
      const target = new Date(today)
      target.setDate(today.getDate() - offset)
      return { date: fmt(target.getFullYear(), target.getMonth() + 1, target.getDate()), confidence: 0.95 }
    }
  }

  // 今天
  if (/今天/.test(text)) return { date: fmt(y, m, d), confidence: 1 }
  // 昨天
  if (/昨天/.test(text)) {
    const target = new Date(today)
    target.setDate(d - 1)
    return { date: fmt(target.getFullYear(), target.getMonth() + 1, target.getDate()), confidence: 1 }
  }
  // 前天
  if (/前天/.test(text)) {
    const target = new Date(today)
    target.setDate(d - 2)
    return { date: fmt(target.getFullYear(), target.getMonth() + 1, target.getDate()), confidence: 1 }
  }
  // 大前天
  if (/大前天/.test(text)) {
    const target = new Date(today)
    target.setDate(d - 3)
    return { date: fmt(target.getFullYear(), target.getMonth() + 1, target.getDate()), confidence: 1 }
  }

  // Default: today
  return { date: fmt(y, m, d), confidence: 0.5 }
}

// ── Amount extraction ──

function extractAmount(text: string): { amount: number | null; confidence: number } {
  const amountRe = /(\d+(?:\.\d{1,2})?)\s*(?:块|元|¥|块钱|元钱|rmb|RMB)?/g
  const matches = [...text.matchAll(amountRe)]

  if (matches.length === 0) return { amount: null, confidence: 0 }

  // Multiple amounts: pick the largest (most likely the real amount)
  let best = 0
  for (const m of matches) {
    const val = parseFloat(m[1])
    if (val > best) best = val
  }

  return { amount: best, confidence: matches.length === 1 ? 1 : 0.7 }
}

// ── Type detection ──

const EXPENSE_WORDS = ['花', '买', '付', '消费', '交', '充', '还', '扣', '转账', '支出', '用了', '花了', '买了']
const INCOME_WORDS = ['赚', '收入', '到账', '发工资', '发薪', '收', '进账', '退款', '报销', '入账']

function extractType(text: string): { type: 'expense' | 'income'; confidence: number } {
  // Find first occurrence position of each keyword
  let firstExpense = Infinity
  let firstIncome = Infinity

  for (const w of EXPENSE_WORDS) {
    const idx = text.indexOf(w)
    if (idx !== -1 && idx < firstExpense) firstExpense = idx
  }
  for (const w of INCOME_WORDS) {
    const idx = text.indexOf(w)
    if (idx !== -1 && idx < firstIncome) firstIncome = idx
  }

  if (firstExpense === Infinity && firstIncome === Infinity) {
    return { type: 'expense', confidence: 0.3 }
  }
  if (firstExpense < firstIncome) {
    return { type: 'expense', confidence: firstIncome === Infinity ? 0.8 : 0.9 }
  }
  return { type: 'income', confidence: firstExpense === Infinity ? 0.8 : 0.9 }
}

// ── Category inference ──

function extractCategory(text: string, type: 'expense' | 'income'): { category: string; confidence: number } {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  let bestMatch = ''
  let bestLen = 0

  for (const cat of categories) {
    for (const kw of cat.keywords) {
      if (text.includes(kw) && kw.length > bestLen) {
        bestLen = kw.length
        bestMatch = cat.name
      }
    }
  }

  if (bestMatch) return { category: bestMatch, confidence: Math.min(bestLen / 3, 1) }
  return { category: '其他', confidence: 0.1 }
}

// ── Note generation ──

function extractNote(text: string, amount: number | null, type: 'expense' | 'income'): string {
  let note = text

  // Remove time words
  note = note.replace(
    /今天|昨天|前天|大前天|上周[一二三四五六七天日]|[周星期][一二三四五六七天日]|\d{1,2}月\d{1,2}[号日]|\d{1,2}[号日]/g,
    ''
  )

  // Remove amount
  if (amount !== null) {
    note = note.replace(new RegExp(`${amount}\\s*(?:块|元|¥|块钱|元钱)?`), '')
  }

  // Remove type-indicating function words
  const typeWords = type === 'expense' ? EXPENSE_WORDS : INCOME_WORDS
  for (const w of typeWords) {
    note = note.replace(w, '')
  }

  // Clean up
  note = note.replace(/^[,，。.\s]+|[,，。.\s]+$/g, '').replace(/\s+/g, ' ').trim()

  return note || text.trim()
}

// ── Main parse function ──

export function parse(text: string): ParseResult {
  const raw = text.trim()
  if (!raw) {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return {
      amount: null,
      category: '其他',
      date: dateStr,
      type: 'expense',
      note: '',
      raw,
      confidence: { amount: 0, category: 0, date: 0, type: 0 },
    }
  }

  const dateResult = extractDate(raw)
  const amountResult = extractAmount(raw)
  const typeResult = extractType(raw)
  const categoryResult = extractCategory(raw, typeResult.type)
  const note = extractNote(raw, amountResult.amount, typeResult.type)

  return {
    amount: amountResult.amount,
    category: categoryResult.category,
    date: dateResult.date,
    type: typeResult.type,
    note,
    raw,
    confidence: {
      amount: amountResult.confidence,
      category: categoryResult.confidence,
      date: dateResult.confidence,
      type: typeResult.confidence,
    },
  }
}

export { EXPENSE_CATEGORIES, INCOME_CATEGORIES }
