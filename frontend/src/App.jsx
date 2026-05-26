import React, { useEffect, useState } from 'react'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/'
    fetch(backend)
      .then((res) => res.text())
      .then((text) => setData(text))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="app">
      <h1>AWS Sample Frontend</h1>
      {error ? <p className="error">Error: {error}</p> : <pre>{data}</pre>}
    </div>
  )
}
