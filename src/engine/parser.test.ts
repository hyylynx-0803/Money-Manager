import { describe, it, expect } from 'vitest'
import { parse } from './parser'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('parse', () => {
  // ── Amount ──
  describe('amount extraction', () => {
    it('extracts integer amount with 块', () => {
      const r = parse('午饭花了35块')
      expect(r.amount).toBe(35)
    })

    it('extracts decimal amount', () => {
      const r = parse('买水果花了23.5元')
      expect(r.amount).toBe(23.5)
    })

    it('extracts amount without unit', () => {
      const r = parse('打车50')
      expect(r.amount).toBe(50)
    })

    it('returns null when no amount present', () => {
      const r = parse('今天去超市了')
      expect(r.amount).toBeNull()
    })

    it('picks largest amount when multiple present', () => {
      const r = parse('奶茶15，打车25，一共花了40')
      expect(r.amount).toBe(40)
    })
  })

  // ── Date ──
  describe('date extraction', () => {
    it('defaults to today when no date word', () => {
      const r = parse('午饭35')
      expect(r.date).toBe(todayStr())
    })

    it('extracts 今天', () => {
      const r = parse('今天午饭35')
      expect(r.date).toBe(todayStr())
    })

    it('extracts 昨天', () => {
      const r = parse('昨天午饭35')
      expect(r.date).toBe(yesterdayStr())
    })

    it('extracts X月X号', () => {
      const r = parse('5月15号午饭35')
      const y = new Date().getFullYear()
      expect(r.date).toBe(`${y}-05-15`)
    })

    it('extracts X号 (default current month)', () => {
      const r = parse('15号午饭35')
      const now = new Date()
      expect(r.date).toBe(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`)
    })
  })

  // ── Type ──
  describe('type detection', () => {
    it('detects expense from 花', () => {
      const r = parse('午饭花了30')
      expect(r.type).toBe('expense')
    })

    it('detects expense from 买', () => {
      const r = parse('买了件衣服200')
      expect(r.type).toBe('expense')
    })

    it('detects income from 到账', () => {
      const r = parse('工资到账8000')
      expect(r.type).toBe('income')
    })

    it('detects income from 赚', () => {
      const r = parse('副业赚了500')
      expect(r.type).toBe('income')
    })

    it('defaults to expense when ambiguous', () => {
      const r = parse('超市30')
      expect(r.type).toBe('expense')
    })

    it('first keyword wins when both expense and income words present', () => {
      const r = parse('花了30退款到账20')
      expect(r.type).toBe('expense') // 花 appears first
    })
  })

  // ── Category ──
  describe('category inference', () => {
    it('infers 餐饮 from food keywords', () => {
      const r = parse('午饭花了30')
      expect(r.category).toBe('餐饮')
    })

    it('infers 交通 from 打车', () => {
      const r = parse('打车花了50')
      expect(r.category).toBe('交通')
    })

    it('infers 购物 from 超市', () => {
      const r = parse('超市买了日用品80')
      expect(r.category).toBe('购物')
    })

    it('infers 住房 from 房租', () => {
      const r = parse('交房租2500')
      expect(r.category).toBe('住房')
    })

    it('infers 工资 for income', () => {
      const r = parse('工资到账10000')
      expect(r.category).toBe('工资')
    })

    it('defaults to 其他 when no match', () => {
      const r = parse('花了100不知道买了啥')
      expect(r.category).toBe('其他')
    })

    it('picks longest keyword match for precision', () => {
      const r = parse('坐地铁花了6块')
      expect(r.category).toBe('交通') // 地铁 > 铁
    })
  })

  // ── Note ──
  describe('note generation', () => {
    it('extracts descriptive text as note', () => {
      const r = parse('昨天和同事聚餐吃火锅花了180')
      expect(r.note).toContain('火锅')
    })

    it('strips time and amount from note, keeps description', () => {
      const r = parse('今天打车50')
      expect(r.note).not.toContain('今天')
      expect(r.note).not.toContain('50')
      expect(r.note).toContain('打车')
    })
  })

  // ── Empty input ──
  describe('empty input', () => {
    it('handles empty string gracefully', () => {
      const r = parse('')
      expect(r.amount).toBeNull()
      expect(r.note).toBe('')
    })
  })
})
