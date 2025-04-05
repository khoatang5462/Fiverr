import { useState } from 'react'

import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Page } from './page/Page'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/page" element={<Page/>} />
    
    </Routes>
  )
}

export default App
