import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecordStore } from '@/store/useRecordStore'
import styles from './Home.module.css'

function Home() {
  const navigate = useNavigate()
  const { monthlyStats, budget, loadRecords, setBudget } = useRecordStore()
  const [showBudgetInput, setShowBudgetInput] = useState(false)
  const [budgetValue, setBudgetValue] = useState('')
  const [savingBudget, setSavingBudget] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const { totalExpense, totalIncome } = monthlyStats

  const budgetPercent = budget && budget > 0
    ? Math.min((totalExpense / budget) * 100, 100)
    : 0

  const budgetRemain = budget ? budget - totalExpense : null
  const isOverBudget = budgetRemain !== null && budgetRemain < 0

  const handleSetBudget = useCallback(async () => {
    const val = parseFloat(budgetValue)
    if (!val || val <= 0) return
    setSavingBudget(true)
    await setBudget(val)
    setSavingBudget(false)
    setShowBudgetInput(false)
    setBudgetValue('')
  }, [budgetValue, setBudget])

  const handleBudgetClick = () => {
    if (budget) {
      setBudgetValue(String(budget))
    }
    setShowBudgetInput(true)
  }

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>记账助手</h1>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={`${styles.card} ${styles.incomeCard}`}>
          <span className={styles.cardLabel}>本月收入</span>
          <span className={styles.cardAmount}>
            ¥ {totalIncome.toFixed(2)}
          </span>
        </div>
        <div className={`${styles.card} ${styles.expenseCard}`}>
          <span className={styles.cardLabel}>本月支出</span>
          <span className={styles.cardAmount}>
            ¥ {totalExpense.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Budget */}
      <div className={styles.budgetCard} onClick={handleBudgetClick}>
        {showBudgetInput ? (
          <div className={styles.budgetInputRow} onClick={(e) => e.stopPropagation()}>
            <input
              className={styles.budgetInput}
              type="number"
              placeholder="输入月度预算"
              value={budgetValue}
              onChange={(e) => setBudgetValue(e.target.value)}
              autoFocus
            />
            <button
              className={styles.budgetSaveBtn}
              disabled={savingBudget || !budgetValue}
              onClick={handleSetBudget}
            >
              确定
            </button>
            <button
              className={styles.budgetCancelBtn}
              onClick={() => setShowBudgetInput(false)}
            >
              取消
            </button>
          </div>
        ) : (
          <>
            <div className={styles.budgetHeader}>
              <span>月度预算</span>
              {budget ? (
                <span className={`${styles.budgetRemain} ${isOverBudget ? styles.overBudget : ''}`}>
                  {isOverBudget ? '已超支 ' : '剩余 '}
                  ¥ {budgetRemain !== null ? Math.abs(budgetRemain).toFixed(2) : '--'}
                </span>
              ) : (
                <span className={styles.budgetRemain}>点击设置</span>
              )}
            </div>
            {budget ? (
              <>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${isOverBudget ? styles.progressOver : ''}`}
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
                <span className={styles.budgetHint}>
                  预算 ¥{budget.toFixed(2)} / 已用 {budgetPercent.toFixed(0)}%
                </span>
              </>
            ) : (
              <span className={styles.budgetHint}>点击设置月度预算</span>
            )}
          </>
        )}
      </div>

      {/* Recent records preview */}
      <div className={styles.recentCard}>
        <div className={styles.recentHeader}>
          <span className={styles.recentTitle}>本月收支</span>
          <button className={styles.viewAll} onClick={() => navigate('/records')}>
            查看全部
          </button>
        </div>
        <div className={styles.recentSummary}>
          <div className={styles.recentItem}>
            <span className={styles.recentLabel}>收入</span>
            <span className={`${styles.recentValue} ${styles.textIncome}`}>
              +¥{totalIncome.toFixed(2)}
            </span>
          </div>
          <div className={styles.recentItem}>
            <span className={styles.recentLabel}>支出</span>
            <span className={`${styles.recentValue} ${styles.textExpense}`}>
              -¥{totalExpense.toFixed(2)}
            </span>
          </div>
          <div className={styles.recentItem}>
            <span className={styles.recentLabel}>结余</span>
            <span className={styles.recentValue}>
              ¥{(totalIncome - totalExpense).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <button className={styles.addBtn} onClick={() => navigate('/add')}>
        + 记一笔
      </button>
    </div>
  )
}

export default Home
