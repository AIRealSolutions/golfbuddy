import { useState, useEffect } from 'react'
import WolfGame from './pages/WolfGame'
import './styles/WolfGame.css'

function App() {
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || `${window.location.origin}/api`
    setApiUrl(url)
  }, [])

  return (
    <div className="app">
      <header>
        <h1>⛳ GolfBuddy</h1>
        <p>Wolf Game Scoring for AIRealSolutions</p>
      </header>
      <main>
        <WolfGame apiUrl={apiUrl} />
      </main>
      <footer>
        <p>API: {apiUrl}</p>
        <p>© 2024 AIRealSolutions</p>
      </footer>
    </div>
  )
}

export default App
