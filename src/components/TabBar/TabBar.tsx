import { NavLink } from 'react-router-dom'
import styles from './TabBar.module.css'

const tabs = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/records', label: '账单', icon: '📋' },
  { path: '/add', label: '记账', icon: '➕' },
  { path: '/report', label: '报表', icon: '📊' },
]

function TabBar() {
  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `${styles.tab} ${isActive ? styles.active : ''}`
          }
          end={tab.path === '/'}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default TabBar
