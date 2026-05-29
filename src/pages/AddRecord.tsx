import { useState, useCallback, useRef, useEffect } from 'react'
import { parse } from '@/engine/parser'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/engine/categories'
import { useRecordStore } from '@/store/useRecordStore'
import type { ParseResult } from '@/engine/types'
import styles from './AddRecord.module.css'

function AddRecord() {
  const addRecord = useRecordStore((s) => s.addRecord)
  const [text, setText] = useState('')
  const [editing, setEditing] = useState<ParseResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleTextChange = useCallback((value: string) => {
    setText(value)
    setSaved(false)
    if (value.trim()) {
      setEditing(parse(value))
    } else {
      setEditing(null)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!editing || editing.amount === null) return
    setSaving(true)
    await addRecord({
      amount: editing.amount,
      category: editing.category,
      date: editing.date,
      type: editing.type,
      note: editing.note || editing.raw,
    })
    setSaving(false)
    setSaved(true)
    setText('')
    setEditing(null)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [editing, addRecord])

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const categories = editing && editing.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>记一笔</h1>

      {/* Input */}
      <div className={styles.inputCard}>
        <textarea
          ref={textareaRef}
          className={styles.textInput}
          placeholder="说说今天花了什么？比如：午饭花了35元"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* Parse Result / Edit Panel */}
      {editing && (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <span className={styles.resultTitle}>识别结果</span>
            {saved && <span className={styles.savedTag}>已保存</span>}
          </div>

          {/* Amount */}
          <div className={styles.field}>
            <label className={styles.label}>金额</label>
            <div className={styles.amountRow}>
              <input
                className={styles.amountInput}
                type="number"
                value={editing.amount ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    amount: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="0.00"
                step="0.01"
              />
              <span className={styles.unit}>¥</span>
            </div>
          </div>

          {/* Type toggle */}
          <div className={styles.field}>
            <label className={styles.label}>类型</label>
            <div className={styles.typeToggle}>
              <button
                className={`${styles.typeBtn} ${editing.type === 'expense' ? styles.typeActive : ''}`}
                onClick={() =>
                  setEditing({ ...editing, type: 'expense', category: '其他' })
                }
              >
                支出
              </button>
              <button
                className={`${styles.typeBtn} ${editing.type === 'income' ? styles.typeIncomeActive : ''}`}
                onClick={() =>
                  setEditing({ ...editing, type: 'income', category: '其他' })
                }
              >
                收入
              </button>
            </div>
          </div>

          {/* Category */}
          <div className={styles.field}>
            <label className={styles.label}>分类</label>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={`${styles.catBtn} ${editing.category === cat.name ? styles.catActive : ''}`}
                  onClick={() => setEditing({ ...editing, category: cat.name })}
                >
                  <span className={styles.catIcon}>{cat.icon}</span>
                  <span className={styles.catName}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className={styles.field}>
            <label className={styles.label}>日期</label>
            <input
              className={styles.dateInput}
              type="date"
              value={editing.date}
              max={todayStr}
              onChange={(e) => setEditing({ ...editing, date: e.target.value })}
            />
          </div>

          {/* Note */}
          <div className={styles.field}>
            <label className={styles.label}>备注</label>
            <input
              className={styles.noteInput}
              type="text"
              value={editing.note}
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
              placeholder="补充说明"
            />
          </div>

          {/* Save */}
          <button
            className={styles.saveBtn}
            disabled={editing.amount === null || saving}
            onClick={handleSave}
          >
            {saving ? '保存中...' : '保存记录'}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!editing && (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>✍️</p>
          <p className={styles.emptyHint}>在上方输入消费内容</p>
          <p className={styles.emptySubHint}>自动识别金额、类别和时间</p>
        </div>
      )}
    </div>
  )
}

export default AddRecord
