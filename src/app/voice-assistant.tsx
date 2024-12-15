'use client'

import { useReducer, useEffect, useCallback, useState } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

// Define the types for state
type State = {
  isListening: boolean
  isUserSpeaking: boolean
  isNabuSpeaking: boolean
  showUI: boolean
  blinkCount: number
  message: string
  transcript: string
  error: string | null
  debugMessages: string[]
}

// Define action types
type Action =
  | { type: 'DETECTION' }
  | { type: 'VOICE_STARTED' }
  | { type: 'VOICE_STOPPED' }
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'STREAMING_STARTED' }
  | { type: 'STREAMING_STOPPED' }
  | { type: 'SYNTHESIZE'; payload: string }
  | { type: 'AUDIO_START' }
  | { type: 'AUDIO_STOP' }
  | { type: 'AUDIO_PLAYED' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_BLINK' }
  | { type: 'ADD_DEBUG_MESSAGE'; payload: string }

// Initial state
const initialState: State = {
  isListening: false,
  isUserSpeaking: false,
  isNabuSpeaking: false,
  showUI: false,
  blinkCount: 0,
  message: '',
  transcript: '',
  error: null,
  debugMessages: [],
}

// Reducer function
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'DETECTION':
      return { ...state, showUI: true, isListening: true, message: 'Listening...' }
    case 'VOICE_STARTED':
      return { ...state, isUserSpeaking: true }
    case 'VOICE_STOPPED':
      return { ...state, isUserSpeaking: false }
    case 'SET_TRANSCRIPT':
      return { ...state, transcript: action.payload }
    case 'STREAMING_STARTED':
      return { ...state, isListening: true, message: 'Listening...' }
    case 'STREAMING_STOPPED':
      return { ...state, isListening: false, message: '' }
    case 'SYNTHESIZE':
      return { ...state, message: action.payload }
    case 'AUDIO_START':
      return { ...state, isNabuSpeaking: true }
    case 'AUDIO_STOP':
      return { ...state, isNabuSpeaking: false }
    case 'AUDIO_PLAYED':
      return { ...state, isNabuSpeaking: false, showUI: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload, showUI: false }
    case 'UPDATE_BLINK':
      return { ...state, blinkCount: (state.blinkCount + 1) % 3 }
    case 'ADD_DEBUG_MESSAGE':
      return { ...state, debugMessages: [...state.debugMessages, action.payload] }
    default:
      return state
  }
}

export default function NabuAssistant() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [showDebug, setShowDebug] = useState(false)

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://192.168.1.82:8675')

    ws.onopen = () => {
      console.log('Connected to Wyoming websocket')
      dispatch({ type: 'SET_ERROR', payload: null })
      dispatch({ type: 'ADD_DEBUG_MESSAGE', payload: 'Connected to Wyoming websocket' })
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('WebSocket message:', data)
      dispatch({ type: 'ADD_DEBUG_MESSAGE', payload: `WebSocket message: ${JSON.stringify(data)}` })

      switch (data.type) {
        case 'detection':
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
      setTimeout(connectWebSocket, 5000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Connection error. Please try again.' })
      dispatch({ type: 'ADD_DEBUG_MESSAGE', payload: `WebSocket error: ${error}` })
    }

    return ws
  }, [])

  useEffect(() => {
    const ws = connectWebSocket()
    return () => {
      ws.close()
    }
  }, [connectWebSocket])

 
  useEffect(() => {
    const getRandomInterval = () => Math.random() * (3000 - 1000) + 1000; // 1 to 3 seconds
    const getBlinkDuration = () => Math.random() * (200 - 100) + 100; // 100 to 200ms

    let blinkTimeout: NodeJS.Timeout;

    const blink = () => {
      dispatch({ type: 'UPDATE_BLINK' });
      blinkTimeout = setTimeout(() => {
        dispatch({ type: 'UPDATE_BLINK' });
        blinkTimeout = setTimeout(blink, getRandomInterval());
      }, getBlinkDuration());
    };

    blink();

    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className={`w-full h-full bg-gray-800 transition-all duration-500 ${state.showUI ? 'max-w-[50vw] rounded-lg' : 'w-full'}`}>
        {/* Nabu's minimal face */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-700 rounded-lg transition-all duration-500 ${state.showUI ? 'w-60 h-50' : 'w-[80vw] h-[80vh]'}`}>
          {/* LED eyes with improved blinking */}
          <div className="absolute top-[30%] left-[20%] w-[60px] h-[60px] bg-cyan-400 rounded-full overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-full bg-gray-700 transition-opacity duration-200 ${state.blinkCount === 1 ? 'opacity-0' : 'opacity-100'} ${state.showUI ? 'opacity-100' : 'opacity-75'}`}></div>
          </div>
          <div className="absolute top-[30%] right-[20%] w-[60px] h-[60px] bg-cyan-400 rounded-full overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-full bg-gray-700 transition-opacity duration-200 ${state.blinkCount === 1 ? 'opacity-0' : 'opacity-100'} ${state.showUI ? 'opacity-100' : 'opacity-75'}`}></div>
          </div>
          {/* LED mouth */}
          <div className={`absolute bottom-[30%] left-1/2 transform -translate-x-1/2 w-[150px] h-[24px] bg-cyan-400 rounded-full ${state.isNabuSpeaking ? 'animate-pulse' : ''}`}>
            {state.isNabuSpeaking && <div className="absolute inset-0 bg-cyan-500 animate-ping"></div>}
          </div>
        </div>

        {/* Status indicators */}
        <div className="absolute top-4 right-4 text-cyan-400">
          {state.isListening ? <Mic size={16} /> : <MicOff size={16} />}
          {state.isNabuSpeaking && <Volume2 size={16} className="animate-pulse" />}
        </div>

        {/* Text display */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          {state.transcript && <p className="text-cyan-400 text-lg font-medium">{state.transcript}</p>}
          {state.message && <p className="text-cyan-300 text-md">{state.message}</p>}
          {state.error && <p className="text-red-400 text-md">{state.error}</p>} 
          {/* Current Time */}
          <div className="mt-4 text-cyan-400 text-6xl font-semibold">
            <p>{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        {showDebug && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-gray-800 p-4 rounded-lg max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-red-400"
                onClick={() => setShowDebug(false)}
              >
                Close
              </button>
              <div className="mt-2 text-gray-400 text-sm max-h-60 overflow-y-auto">
                {state.debugMessages.map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
            </div>
          </div>
        )}
        <button
          className="absolute bottom-4 right-4 text-cyan-400"
          onClick={() => setShowDebug(true)}
        >
          Show Debug
        </button>
      </div>
    </div>
  )
}
