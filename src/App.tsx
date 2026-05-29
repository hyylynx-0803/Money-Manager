import { Routes, Route } from 'react-router-dom'
import TabBar from './components/TabBar/TabBar'
import EditModal from './components/EditModal/EditModal'
import Home from './pages/Home'
import AddRecord from './pages/AddRecord'
import Records from './pages/Records'
import Report from './pages/Report'

function App() {
  return (
    <>
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddRecord />} />
          <Route path="/records" element={<Records />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
      <TabBar />
      <EditModal />
    </>
  )
}

export default App
