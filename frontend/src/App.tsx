import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BrowsePools from './pages/BrowsePools'
import PoolDetail from './pages/PoolDetail'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pools" element={<BrowsePools />} />
        <Route path="/pool/:poolId" element={<PoolDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
