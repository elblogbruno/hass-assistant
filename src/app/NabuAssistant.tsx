'use client'

import { useReducer, useEffect, useState } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { initialState, reducer } from './state'
import { useWebSocket } from './websocket'

export default function NabuAssistant() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [showDebug, setShowDebug] = useState(false)
  const connectWebSocket = useWebSocket(dispatch)
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const ws = connectWebSocket()
    return () => {
      ws.close()
    }
  }, [connectWebSocket])

  useEffect(() => {
    const blinkPattern = [200, 100, 300, 100, 200, 100, 400, 100]
    let blinkTimeout: NodeJS.Timeout
    let patternIndex = 0

    const blink = () => {
      dispatch({ type: 'UPDATE_BLINK' })
      blinkTimeout = setTimeout(() => {
        dispatch({ type: 'UPDATE_BLINK' })
        patternIndex = (patternIndex + 1) % blinkPattern.length
        blinkTimeout = setTimeout(blink, blinkPattern[patternIndex])
      }, blinkPattern[patternIndex])
    }

    blink()

    return () => clearTimeout(blinkTimeout)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className={`w-full h-full bg-gray-800 transition-all duration-500 ${state.showUI ? 'rounded-lg' : 'w-full'}`}>
        {/* Current Time */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-cyan-400 text-6xl font-semibold">
          <p>{currentTime}</p>
        </div>
        {/* Nabu's minimal face */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-[150px] border-[30px] border-sky-500 transition-all duration-500 ${state.showUI ? 'w-[60vw] h-[60vh]' : state.transcript || state.message || state.error ? 'w-[70vw] h-[70vh]' : 'w-[80vw] h-[80vh]'}`}>
          {/* LED eyes with improved blinking */}
          <div className="absolute top-[30%] left-[20%] w-[60px] h-[60px] bg-sky-400 rounded-full overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-full bg-gray-700 transition-transform duration-200 ${state.blinkCount === 1 ? 'transform -translate-y-full' : 'transform translate-y-0'} ${state.showUI ? 'opacity-100' : 'opacity-75'}`}></div>
          </div>
          <div className="absolute top-[30%] right-[20%] w-[60px] h-[60px] bg-sky-400 rounded-full overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-full bg-gray-700 transition-transform duration-200 ${state.blinkCount === 1 ? 'transform -translate-y-full' : 'transform translate-y-0'} ${state.showUI ? 'opacity-100' : 'opacity-75'}`}></div>
          </div>
          {/* LED mouth */}
          <div className={`absolute bottom-[30%] left-1/2 transform -translate-x-1/2 w-[150px] h-[24px] bg-sky-400 rounded-full ${state.isNabuSpeaking ? 'animate-pulse' : state.isListening ? 'animate-bounce' : ''}`}>
            {state.isNabuSpeaking && <div className="absolute inset-0 bg-sky-500 animate-ping"></div>}
          </div>
        </div>

        {/* Status indicators */}
        <div className="absolute top-4 right-4 text-cyan-400">
          {state.isListening ? <Mic size={16} /> : <MicOff size={16} />}
          {state.isNabuSpeaking && <Volume2 size={16} className="animate-pulse" />}
        </div>

        {/* Text display */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          {state.transcript && <p className="text-cyan-400 text-2xl font-medium">{state.transcript}</p>}
          {state.message && <p className="text-cyan-300 text-xl">{state.message}</p>}
          {state.error && <p className="text-red-400 text-xl">{state.error}</p>}
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