import { useState, useEffect } from 'react'
import { useRecordStore } from '@/store/useRecordStore'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/engine/categories'
import type { RecordItem } from '@/db/models'
import styles from './EditModal.module.css'

function EditModal() {
  const { editingRecord, setEditingRecord, updateRecord } = useRecordStore()
  const [form, setForm] = useState<RecordItem | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingRecord) {
      setForm({ ...editingRecord })
    }
  }, [editingRecord])

  if (!form) return null

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const handleSave = async () => {
    if (!form.id || form.amount === undefined) return
    setSaving(true)
    await updateRecord(form.id, {
      amount: form.amount,
      category: form.category,
      date: form.date,
      type: form.type,
      note: form.note,
    })
    setSaving(false)
  }

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setEditingRecord(null)
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>编辑记录</h2>
          <button className={styles.closeBtn} onClick={() => setEditingRecord(null)}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {/* Amount */}
          <div className={styles.field}>
            <label className={styles.label}>金额</label>
            <div className={styles.amountRow}>
              <input
                className={styles.amountInput}
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
                }
                step="0.01"
              />
              <span className={styles.unit}>¥</span>
            </div>
          </div>

          {/* Type */}
          <div className={styles.field}>
            <label className={styles.label}>类型</label>
            <div className={styles.typeToggle}>
              <button
                className={`${styles.typeBtn} ${form.type === 'expense' ? styles.typeActive : ''}`}
                onClick={() => setForm({ ...form, type: 'expense', category: '其他' })}
              >
                支出
              </button>
              <button
                className={`${styles.typeBtn} ${form.type === 'income' ? styles.typeIncomeActive : ''}`}
                onClick={() => setForm({ ...form, type: 'income', category: '其他' })}
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
                  className={`${styles.catBtn} ${form.category === cat.name ? styles.catActive : ''}`}
                  onClick={() => setForm({ ...form, category: cat.name })}
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
              value={form.date}
              max={todayStr}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          {/* Note */}
          <div className={styles.field}>
            <label className={styles.label}>备注</label>
            <input
              className={styles.noteInput}
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="补充说明"
            />
          </div>

          <button
            className={styles.saveBtn}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditModal
