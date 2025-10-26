import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BrowsePools from './pages/BrowsePools'
import PoolDetail from './pages/PoolDetail'
import Dashboard from './pages/Dashboard'
import CreatePool from './pages/CreatePool'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pools" element={<BrowsePools />} />
        <Route path="/pool/:poolId" element={<PoolDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-pool" element={<CreatePool />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
