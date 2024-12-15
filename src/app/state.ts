// Define the types for state
export type State = {
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
export type Action =
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
export const initialState: State = {
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
export function reducer(state: State, action: Action): State {
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
      return { ...state, isNabuSpeaking: false, showUI: false, message: '' }
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