import { useCallback } from 'react'
import { Action } from './state'

function createWebSocket(dispatch: React.Dispatch<Action>) {
  const ws = new WebSocket('ws://192.168.1.82:8675')

  let reconnectTimeout: NodeJS.Timeout | null = null;

  const clearReconnectTimeout = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  const reconnect = () => {
    clearReconnectTimeout();
    reconnectTimeout = setTimeout(() => {
      createWebSocket(dispatch)
    }, 1000); // Reduce the reconnection delay to 1 second for a more robotic blink
  };

  ws.onopen = () => {
    console.log('Connected to Wyoming websocket')
    dispatch({ type: 'SET_ERROR', payload: null })
    dispatch({ type: 'ADD_DEBUG_MESSAGE', payload: 'Connected to Wyoming websocket' })
    clearReconnectTimeout();
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log('WebSocket message:', data)
    dispatch({ type: 'ADD_DEBUG_MESSAGE', payload: `WebSocket message: ${JSON.stringify(data)}` })

    switch (data.type) {
      case 'detection':
        dispatch({ type: 'DETECTION' })
        break
      case 'detect':
        dispatch({ type: 'DETECTION' })
        break
      case 'voice-started':
        dispatch({ type: 'VOICE_STARTED' })
        break
      case 'voice-stopped':
        dispatch({ type: 'VOICE_STOPPED' })
        break
      case 'transcript':
        dispatch({ type: 'SET_TRANSCRIPT', payload: data.data.text })
        break
      case 'streaming-started':
        dispatch({ type: 'STREAMING_STARTED' })
        break
      case 'streaming-stopped':
        dispatch({ type: 'STREAMING_STOPPED' })
        break
      case 'synthesize':
        dispatch({ type: 'SYNTHESIZE', payload: data.data.text })
        break
      case 'audio-start':
        dispatch({ type: 'AUDIO_START' })
        break
      case 'audio-stop':
        dispatch({ type: 'AUDIO_STOP' })
        break
      case 'played':
        dispatch({ type: 'AUDIO_PLAYED' })
        break
      case 'error':
        dispatch({ type: 'SET_ERROR', payload: data.message })
        break
    }
  }

  ws.onclose = () => {
    console.log('Disconnected from Wyoming websocket')
    dispatch({ type: 'SET_ERROR', payload: 'Connection lost. Reconnecting...' })
    dispatch({ type: 'ADD_DEBUG_MESSAGE', payload: 'Disconnected from Wyoming websocket' })
    reconnect();
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    dispatch({ type: 'SET_ERROR', payload: 'Connection error. Please try again.' })
    dispatch({ type: 'ADD_DEBUG_MESSAGE', payload: `WebSocket error: ${error}` })
    ws.close();
    reconnect();
  }

  return ws
}

export function useWebSocket(dispatch: React.Dispatch<Action>) {
  return useCallback(() => createWebSocket(dispatch), [dispatch])
}
