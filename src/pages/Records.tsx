import { useEffect, useState, useCallback } from 'react'
import { useRecordStore } from '@/store/useRecordStore'
import { getCategoryIcon } from '@/engine/categories'
import type { RecordItem } from '@/db/models'
import styles from './Records.module.css'

function Records() {
  const {
    records,
    loading,
    searchRecords,
    loadRecords,
    deleteRecord,
    setEditingRecord,
  } = useRecordStore()

  const [keyword, setKeyword] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all')
  const [filterCategory, setFilterCategory] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const handleSearch = useCallback(
    (kw: string) => {
      setKeyword(kw)
      searchRecords(kw)
    },
    [searchRecords]
  )

  const filteredRecords = records.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false
    if (filterCategory && r.category !== filterCategory) return false
    return true
  })

  // Collect unique categories from current records
  const categories = [...new Set(records.map((r) => r.category))]

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteRecord(id)
      setDeleteConfirm(null)
    },
    [deleteRecord]
  )

  const handleEdit = useCallback(
    (record: RecordItem) => {
      setEditingRecord(record)
    },
    [setEditingRecord]
  )

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>账单</h1>

      {/* Search */}
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="搜索备注或分类..."
          value={keyword}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {keyword && (
          <button className={styles.clearBtn} onClick={() => handleSearch('')}>
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <button
            className={`${styles.filterBtn} ${filterType === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('all')}
          >
            全部
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'expense' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('expense')}
          >
            支出
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'income' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('income')}
          >
            收入
          </button>
        </div>

        {categories.length > 0 && (
          <div className={styles.categoryScroll}>
            <button
              className={`${styles.catFilterBtn} ${filterCategory === '' ? styles.catFilterActive : ''}`}
              onClick={() => setFilterCategory('')}
            >
              全部分类
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.catFilterBtn} ${filterCategory === cat ? styles.catFilterActive : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Records list */}
      {loading ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>加载中...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📋</p>
          <p className={styles.emptyText}>
            {records.length === 0 ? '还没有记账记录' : '没有匹配的记录'}
          </p>
          <p className={styles.emptyHint}>
            {records.length === 0 ? '去记一笔吧' : '试试其他筛选条件'}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredRecords.map((record) => {
            if (!record.id) return null
            return (
              <div key={record.id} className={styles.item}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}>
                    {getCategoryIcon(record.category, record.type)}
                  </span>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemCategory}>{record.category}</span>
                    {record.note && (
                      <span className={styles.itemNote}>{record.note}</span>
                    )}
                    <span className={styles.itemDate}>{record.date}</span>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <span
                    className={`${styles.itemAmount} ${
                      record.type === 'expense' ? styles.expense : styles.income
                    }`}
                  >
                    {record.type === 'expense' ? '-' : '+'}¥{record.amount.toFixed(2)}
                  </span>
                  <div className={styles.itemActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEdit(record)}
                    >
                      编辑
                    </button>
                    {deleteConfirm === record.id ? (
                      <span className={styles.confirmRow}>
                        <button
                          className={styles.confirmYes}
                          onClick={() => handleDelete(record.id!)}
                        >
                          确认
                        </button>
                        <button
                          className={styles.confirmNo}
                          onClick={() => setDeleteConfirm(null)}
                        >
                          取消
                        </button>
                      </span>
                    ) : (
                      <button
                        className={styles.actionDel}
                        onClick={() => setDeleteConfirm(record.id!)}
                      >
                        删除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Records
