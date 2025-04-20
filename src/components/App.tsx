import { useState } from 'react'
import useWebsocket from '../hooks/useWebSocket'

function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('unknown');
  const { connect, socket } = useWebsocket();

  function sendMessage() {
    if (socket.current) {
      socket.current.send(JSON.stringify({ name: 'Good evening' }));
    }
  }

  return (
    <>
      <h1>Vite + React + Cloudflare</h1>
      <div className='card'>
        <button
          onClick={() => setCount((count) => count + 1)}
          aria-label='increment'
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR?
        </p>
      </div>
      <div className='card'>
        <button
          onClick={() => {
            fetch('/api/')
              .then((res) => res.json() as Promise<{ name: string }>)
              .then((data) => setName(data.name))
          }}
          aria-label='get name'
        >
          Name from API is: {name}
        </button>
        <button
          onClick={connect}>Connect</button>
        <button onClick={sendMessage}>Send Message</button>
        <p>
          Edit <code>worker/index.ts</code> to change the name
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
