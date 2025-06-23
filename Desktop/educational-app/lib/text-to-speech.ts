// Text-to-Speech utility with local accents and voice selection
export interface VoiceConfig {
  lang: string
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
}

export interface LanguageVoiceMap {
  [key: string]: {
    primary: string
    alternatives: string[]
    rate: number
    pitch: number
  }
}

// Voice configurations for different languages with local accents
const voiceConfigs: LanguageVoiceMap = {
  'en-US': {
    primary: 'en-US',
    alternatives: ['en-US-Neural2-A', 'en-US-Neural2-C', 'en-US-Neural2-D', 'en-US-Neural2-E', 'en-US-Neural2-F', 'en-US-Neural2-G', 'en-US-Neural2-H', 'en-US-Neural2-I', 'en-US-Neural2-J'],
    rate: 0.8,
    pitch: 1.0
  },
  'en-GB': {
    primary: 'en-GB',
    alternatives: ['en-GB-Neural2-A', 'en-GB-Neural2-B', 'en-GB-Neural2-C', 'en-GB-Neural2-D'],
    rate: 0.8,
    pitch: 1.0
  },
  'fr-FR': {
    primary: 'fr-FR',
    alternatives: ['fr-FR-Neural2-A', 'fr-FR-Neural2-B', 'fr-FR-Neural2-C', 'fr-FR-Neural2-D', 'fr-FR-Neural2-E'],
    rate: 0.75,
    pitch: 1.0
  },
  'fr-CA': {
    primary: 'fr-CA',
    alternatives: ['fr-CA-Neural2-A', 'fr-CA-Neural2-B', 'fr-CA-Neural2-C', 'fr-CA-Neural2-D'],
    rate: 0.75,
    pitch: 1.0
  },
  'es-ES': {
    primary: 'es-ES',
    alternatives: ['es-ES-Neural2-A', 'es-ES-Neural2-B', 'es-ES-Neural2-C', 'es-ES-Neural2-D', 'es-ES-Neural2-E'],
    rate: 0.8,
    pitch: 1.0
  },
  'es-MX': {
    primary: 'es-MX',
    alternatives: ['es-MX-Neural2-A', 'es-MX-Neural2-B', 'es-MX-Neural2-C', 'es-MX-Neural2-D'],
    rate: 0.8,
    pitch: 1.0
  },
  'ca-ES': {
    primary: 'ca-ES',
    alternatives: ['ca-ES-Neural2-A', 'ca-ES-Neural2-B', 'ca-ES-Neural2-C', 'ca-ES-Neural2-D'],
    rate: 0.75,
    pitch: 1.0
  }
}

// Language mapping for the app
const languageToVoiceMap: { [key: string]: string } = {
  'english': 'en-US',
  'french': 'fr-FR',
  'spanish': 'es-ES',
  'catalan': 'ca-ES',
  'en': 'en-US',
  'fr': 'fr-FR',
  'es': 'es-ES',
  'ca': 'ca-ES'
}

export class TextToSpeech {
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSpeaking = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  // Get available voices for a specific language
  getAvailableVoices(lang: string): SpeechSynthesisVoice[] {
    if (!this.synthesis) return []
    
    const voiceLang = languageToVoiceMap[lang] || lang
    return this.synthesis.getVoices().filter(voice => 
      voice.lang.startsWith(voiceLang.split('-')[0])
    )
  }

  // Get the best voice for a language
  getBestVoice(lang: string): SpeechSynthesisVoice | null {
    if (!this.synthesis) return null
    
    const voices = this.getAvailableVoices(lang)
    if (voices.length === 0) return null

    // Try to find a neural voice first
    const neuralVoice = voices.find(voice => 
      voice.name.includes('Neural') || voice.name.includes('Premium')
    )
    
    if (neuralVoice) return neuralVoice

    // Fall back to any available voice
    return voices[0]
  }

  // Speak text with local accent
  speak(text: string, lang: string, options: Partial<VoiceConfig> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Stop any current speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)
      this.currentUtterance = utterance

      // Set language
      const voiceLang = languageToVoiceMap[lang] || lang
      utterance.lang = voiceLang

      // Get the best voice for the language
      const voice = this.getBestVoice(lang)
      if (voice) {
        utterance.voice = voice
      }

      // Set speech parameters
      utterance.rate = options.rate ?? voiceConfigs[voiceLang]?.rate ?? 0.8
      utterance.pitch = options.pitch ?? voiceConfigs[voiceLang]?.pitch ?? 1.0
      utterance.volume = options.volume ?? 1.0

      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true
      }

      utterance.onend = () => {
        this.isSpeaking = false
        this.currentUtterance = null
        resolve()
      }

      utterance.onerror = (event) => {
        this.isSpeaking = false
        this.currentUtterance = null
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      // Start speaking
      this.synthesis.speak(utterance)
    })
  }

  // Stop current speech
  stop(): void {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel()
      this.isSpeaking = false
      this.currentUtterance = null
    }
  }

  // Check if currently speaking
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking
  }

  // Pause speech
  pause(): void {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause()
    }
  }

  // Resume speech
  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume()
    }
  }

  // Speak with different accents for the same language
  speakWithAccent(text: string, lang: string, accent: 'standard' | 'local' | 'child' = 'standard'): Promise<void> {
    const accentConfigs = {
      standard: { rate: 0.8, pitch: 1.0 },
      local: { rate: 0.75, pitch: 1.1 },
      child: { rate: 0.9, pitch: 1.2 }
    }

    return this.speak(text, lang, accentConfigs[accent])
  }

  // Speak numbers with proper pronunciation
  speakNumber(number: number, lang: string): Promise<void> {
    const numberText = this.formatNumberForSpeech(number, lang)
    return this.speak(numberText, lang, { rate: 0.7 })
  }

  // Format numbers for better speech pronunciation
  private formatNumberForSpeech(number: number, lang: string): string {
    const numberFormatters = {
      'en': (n: number) => n.toLocaleString('en-US'),
      'fr': (n: number) => n.toLocaleString('fr-FR'),
      'es': (n: number) => n.toLocaleString('es-ES'),
      'ca': (n: number) => n.toLocaleString('ca-ES')
    }

    const formatter = numberFormatters[lang as keyof typeof numberFormatters] || numberFormatters['en']
    return formatter(number)
  }
}

// Create a singleton instance
export const tts = new TextToSpeech()

// Convenience functions
export const speakText = (text: string, lang: string, options?: Partial<VoiceConfig>) => {
  return tts.speak(text, lang, options)
}

export const speakWithAccent = (text: string, lang: string, accent: 'standard' | 'local' | 'child' = 'standard') => {
  return tts.speakWithAccent(text, lang, accent)
}

export const speakNumber = (number: number, lang: string) => {
  return tts.speakNumber(number, lang)
}

export const stopSpeech = () => {
  tts.stop()
}

export const isSpeaking = () => {
  return tts.isCurrentlySpeaking()
} 