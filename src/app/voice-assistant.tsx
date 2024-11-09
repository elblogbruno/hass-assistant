'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://192.168.1.82:8675')

    ws.onopen = () => {
      console.log('Connected to Wyoming websocket')
      setError(null)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'start_listening':
          setIsListening(true)
          setMessage('Listening...')
          break
        case 'stop_listening':
          setIsListening(false)
          setMessage('')
          break
        case 'transcription':
          setMessage(data.text)
          break
        case 'start_speaking':
          setIsSpeaking(true)
          break
        case 'stop_speaking':
          setIsSpeaking(false)
          break
        case 'error':
          setError(data.message)
          break
      }
    }

    ws.onclose = () => {
      console.log('Disconnected from Wyoming websocket')
      setError('Connection lost. Reconnecting...')
      setTimeout(connectWebSocket, 5000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('Connection error. Please try again.')
    }

    return ws
  }, [])

  useEffect(() => {
    const ws = connectWebSocket()
    return () => {
      ws.close()
    }
  }, [connectWebSocket])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {isListening ? (
              <Mic className="w-8 h-8 text-blue-500" />
            ) : (
              <MicOff className="w-8 h-8 text-gray-400" />
            )}
            <span className="ml-2 text-lg font-semibold">
              {isListening ? 'Listening' : 'Not Listening'}
            </span>
          </div>
          <div className="flex items-center">
            {isSpeaking ? (
              <Volume2 className="w-8 h-8 text-green-500" />
            ) : (
              <VolumeX className="w-8 h-8 text-gray-400" />
            )}
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
          <p className="text-center text-lg">{message || "I'm ready to help!"}</p>
        </div>
        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}