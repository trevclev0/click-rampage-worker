import { useRef } from 'react';

function useWebsocket() {
    const socket = useRef<WebSocket | null>(null);

    function connect() {
        socket.current = new WebSocket('ws://localhost:5173/ws');
        socket.current.addEventListener('open', () => {
            console.log('WebSocket connection established');
        });
        socket.current.addEventListener('error', (err) => {
            console.log('WebSocket connection error:', err);
        });
        socket.current.addEventListener('close', () => {
            console.log('WebSocket connection close:');
        });

        socket.current.addEventListener('message', (event) => {
            console.log('event', event);
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
        });
    }

    return { connect, socket };
}

export default useWebsocket;