import { useState, useEffect, useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts'
import { useRecordStore } from '@/store/useRecordStore'
import * as recordDb from '@/db/records'
import { EXPENSE_CATEGORIES } from '@/engine/categories'
import styles from './Report.module.css'

function currentMonthStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m, 10)}月`
}

function getMonthsBack(count: number): string[] {
  const d = new Date()
  const months: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
    months.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

interface MonthlyStat {
  totalExpense: number
  totalIncome: number
  categoryBreakdown: Record<string, number>
}

function Report() {
  const { monthlyStats } = useRecordStore()
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr())
  const [currentStats, setCurrentStats] = useState<MonthlyStat | null>(null)
  const [trendData, setTrendData] = useState<MonthlyStat[]>([])
  const [loading, setLoading] = useState(false)

  // Load selected month stats
  useEffect(() => {
    if (selectedMonth === currentMonthStr()) {
      setCurrentStats(monthlyStats)
      return
    }
    setLoading(true)
    recordDb.getMonthlyStats(selectedMonth).then((stats) => {
      setCurrentStats(stats)
      setLoading(false)
    })
  }, [selectedMonth, monthlyStats])

  // Load trend data (last 6 months)
  useEffect(() => {
    const months = getMonthsBack(6)
    Promise.all(months.map((m) => recordDb.getMonthlyStats(m))).then(setTrendData)
  }, [selectedMonth])

  const prevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setSelectedMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    )
  }

  const nextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m, 1)
    setSelectedMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    )
  }

  const isCurrentMonth = selectedMonth === currentMonthStr()

  // Pie chart option
  const pieOption = useMemo(() => {
    if (!currentStats) return {}
    const data = EXPENSE_CATEGORIES
      .filter((c) => (currentStats.categoryBreakdown[c.name] || 0) > 0)
      .map((c) => ({
        name: c.name,
        value: currentStats.categoryBreakdown[c.name] || 0,
      }))

    if (data.length === 0) return {}

    return {
      tooltip: {
        trigger: 'item' as const,
        formatter: '{b}: ¥{c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' },
          },
          data,
        },
      ],
      color: [
        '#4A90D9', '#E85D75', '#4CAF50', '#FF9800', '#9C27B0',
        '#00BCD4', '#FF5722', '#607D8B', '#8BC34A', '#FFC107',
      ],
    }
  }, [currentStats])

  // Bar chart option
  const barOption = useMemo(() => {
    const months = getMonthsBack(6)
    const labels = months.map((m) => `${parseInt(m.split('-')[1], 10)}月`)
    const expenses = trendData.map((d) => d.totalExpense)
    const incomes = trendData.map((d) => d.totalIncome)

    return {
      tooltip: {
        trigger: 'axis' as const,
        formatter: (params: Array<{ name: string; seriesName: string; value: number }>) => {
          let result = params[0]?.name || ''
          for (const p of params) {
            result += `<br/>${p.seriesName}: ¥${p.value.toFixed(2)}`
          }
          return result
        },
      },
      legend: {
        data: ['支出', '收入'],
        bottom: 0,
        textStyle: { fontSize: 12 },
      },
      grid: { left: 8, right: 8, top: 8, bottom: 32 },
      xAxis: {
        type: 'category' as const,
        data: labels,
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          fontSize: 11,
          formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)),
        },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        {
          name: '支出',
          type: 'bar',
          data: expenses,
          itemStyle: { color: '#E85D75', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 20,
        },
        {
          name: '收入',
          type: 'bar',
          data: incomes,
          itemStyle: { color: '#4CAF50', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 20,
        },
      ],
    }
  }, [trendData])

  const stats = currentStats || { totalExpense: 0, totalIncome: 0, categoryBreakdown: {} }

  return (
    <div className={styles.report}>
      <h1 className={styles.title}>报表</h1>

      {/* Month Selector */}
      <div className={styles.monthSelector}>
        <button className={styles.monthBtn} onClick={prevMonth}>
          ‹
        </button>
        <span className={styles.monthLabel}>{monthLabel(selectedMonth)}</span>
        <button className={styles.monthBtn} onClick={nextMonth} disabled={isCurrentMonth}>
          ›
        </button>
      </div>

      {/* Summary Row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>收入</span>
          <span className={`${styles.summaryValue} ${styles.income}`}>
            ¥{stats.totalIncome.toFixed(0)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>支出</span>
          <span className={`${styles.summaryValue} ${styles.expense}`}>
            ¥{stats.totalExpense.toFixed(0)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>结余</span>
          <span className={styles.summaryValue}>
            ¥{(stats.totalIncome - stats.totalExpense).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <>
          {/* Pie Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>支出分类</h3>
            {stats.totalExpense > 0 ? (
              <ReactEChartsCore
                echarts={echarts}
                option={pieOption}
                style={{ height: 240 }}
              />
            ) : (
              <div className={styles.noData}>本月暂无支出记录</div>
            )}
          </div>

          {/* Bar Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>近6个月趋势</h3>
            {trendData.some((d) => d.totalExpense > 0 || d.totalIncome > 0) ? (
              <ReactEChartsCore
                echarts={echarts}
                option={barOption}
                style={{ height: 240 }}
              />
            ) : (
              <div className={styles.noData}>暂无历史数据</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Report
