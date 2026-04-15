import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Daily from './pages/Daily'

function Nav() {
  const base = 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors'
  const active = `${base} bg-blue-600 text-white`
  const inactive = `${base} text-gray-600 hover:bg-gray-100`

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-gray-900 text-base">VocabularyTracker 📖</span>
        <nav className="flex gap-1">
          <NavLink to="/"      end className={({ isActive }) => isActive ? active : inactive}>Words</NavLink>
          <NavLink to="/daily"     className={({ isActive }) => isActive ? active : inactive}>Daily</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <Routes>
          <Route path="/"      element={<Home />} />
          <Route path="/daily" element={<Daily />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
