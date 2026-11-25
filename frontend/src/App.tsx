import { useState } from 'react'
import './App.css'
import { CounterView } from './components/CounterView'
import { KitchenView } from './components/KitchenView'

type Tab = 'counter' | 'kitchen'

/**
 * Root component: switches between the counter and kitchen screens.
 */
function App() {
  const [tab, setTab] = useState<Tab>('counter')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Restaurant Orders</h1>
        <nav className="tabs" aria-label="Screens">
          <button
            type="button"
            aria-pressed={tab === 'counter'}
            onClick={() => setTab('counter')}
          >
            Counter
          </button>
          <button
            type="button"
            aria-pressed={tab === 'kitchen'}
            onClick={() => setTab('kitchen')}
          >
            Kitchen
          </button>
        </nav>
      </header>
      <main>{tab === 'counter' ? <CounterView /> : <KitchenView />}</main>
    </div>
  )
}

export default App
