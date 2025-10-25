import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BrowsePools from './pages/BrowsePools'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pools" element={<BrowsePools />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
