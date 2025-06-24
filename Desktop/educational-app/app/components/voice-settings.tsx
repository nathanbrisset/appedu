"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Volume2, Settings, Play, Square } from "lucide-react"
import { tts, speakText, stopSpeech, isSpeaking } from "@/lib/text-to-speech"

interface VoiceSettingsProps {
  lang: string
  onClose: () => void
}

const accentOptions = [
  { value: 'standard', label: { fr: 'Standard', es: 'Estándar', en: 'Standard', ca: 'Estàndard' } },
  { value: 'local', label: { fr: 'Accent local', es: 'Acento local', en: 'Local accent', ca: 'Accent local' } },
  { value: 'child', label: { fr: 'Voix d\'enfant', es: 'Voz de niño', en: 'Child voice', ca: 'Veu d\'infant' } }
]

const testPhrases = {
  fr: "Bonjour ! Je suis votre assistant vocal. Comment puis-je vous aider aujourd'hui ?",
  es: "¡Hola! Soy tu asistente de voz. ¿Cómo puedo ayudarte hoy?",
  en: "Hello! I'm your voice assistant. How can I help you today?",
  ca: "Hola! Sóc el teu assistent de veu. Com puc ajudar-te avui?"
}

export default function VoiceSettings({ lang, onClose }: VoiceSettingsProps) {
  const [selectedAccent, setSelectedAccent] = useState<'standard' | 'local' | 'child'>('standard')
  const [rate, setRate] = useState([0.8])
  const [pitch, setPitch] = useState([1.0])
  const [volume, setVolume] = useState([1.0])
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    // Load saved settings first
    const loadSavedSettings = () => {
      const savedSettings = localStorage.getItem(`voice-settings-${lang}`)
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          setSelectedAccent(settings.accent || 'standard')
          setRate([settings.rate || 0.8])
          setPitch([settings.pitch || 1.0])
          setVolume([settings.volume || 1.0])
          setSelectedVoice(settings.voice || '')
        } catch (error) {
          console.error('Error loading voice settings:', error)
        }
      }
    }

    loadSavedSettings()

    // Load available voices
    const loadVoices = () => {
      const voices = tts.getAvailableVoices(lang)
      setAvailableVoices(voices)
      
      // Set default voice if not already set
      if (!selectedVoice) {
        const bestVoice = tts.getBestVoice(lang)
        if (bestVoice) {
          setSelectedVoice(bestVoice.name)
        }
      }
    }

    // Wait for voices to load
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speechSynthesis.getVoices().length > 0) {
        loadVoices()
      } else {
        speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [lang, selectedVoice])

  const testVoice = () => {
    if (isTesting) {
      stopSpeech()
      setIsTesting(false)
      return
    }

    const testText = testPhrases[lang as keyof typeof testPhrases] || testPhrases.en
    setIsTesting(true)

    // Apply current settings for testing
    const testSettings = {
      rate: rate[0],
      pitch: pitch[0],
      volume: volume[0],
      voice: selectedVoice
    }

    speakText(testText, lang, testSettings).then(() => {
      setIsTesting(false)
    }).catch(() => {
      setIsTesting(false)
    })
  }

  const saveSettings = () => {
    // Save settings to localStorage
    const settings = {
      accent: selectedAccent,
      rate: rate[0],
      pitch: pitch[0],
      volume: volume[0],
      voice: selectedVoice
    }
    
    localStorage.setItem(`voice-settings-${lang}`, JSON.stringify(settings))
    
    // Apply settings immediately to the TTS system
    tts.updateSettings(lang, settings)
    
    onClose()
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-gray-800 flex items-center justify-center gap-2">
          <Settings className="h-5 w-5" />
          {lang === 'fr' && "Paramètres vocaux"}
          {lang === 'es' && "Configuración de voz"}
          {lang === 'en' && "Voice Settings"}
          {lang === 'ca' && "Configuració de veu"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Accent Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {lang === 'fr' && "Accent"}
            {lang === 'es' && "Acento"}
            {lang === 'en' && "Accent"}
            {lang === 'ca' && "Accent"}
          </label>
          <Select value={selectedAccent} onValueChange={(value: 'standard' | 'local' | 'child') => setSelectedAccent(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label[lang as keyof typeof option.label]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection */}
        {availableVoices.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {lang === 'fr' && "Voix"}
              {lang === 'es' && "Voz"}
              {lang === 'en' && "Voice"}
              {lang === 'ca' && "Veu"}
            </label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Speed Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {lang === 'fr' && "Vitesse"}
            {lang === 'es' && "Velocidad"}
            {lang === 'en' && "Speed"}
            {lang === 'ca' && "Velocitat"}
          </label>
          <Slider
            value={rate}
            onValueChange={setRate}
            max={2}
            min={0.5}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">{rate[0].toFixed(1)}x</div>
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {lang === 'fr' && "Hauteur"}
            {lang === 'es' && "Tono"}
            {lang === 'en' && "Pitch"}
            {lang === 'ca' && "Tonalitat"}
          </label>
          <Slider
            value={pitch}
            onValueChange={setPitch}
            max={2}
            min={0.5}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">{pitch[0].toFixed(1)}x</div>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {lang === 'fr' && "Volume"}
            {lang === 'es' && "Volumen"}
            {lang === 'en' && "Volume"}
            {lang === 'ca' && "Volum"}
          </label>
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">{Math.round(volume[0] * 100)}%</div>
        </div>

        {/* Test Button */}
        <div className="flex justify-center">
          <Button
            onClick={testVoice}
            className={`flex items-center gap-2 ${
              isTesting 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isTesting ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isTesting 
              ? (lang === 'fr' ? 'Arrêter' : lang === 'es' ? 'Parar' : lang === 'en' ? 'Stop' : 'Aturar')
              : (lang === 'fr' ? 'Tester' : lang === 'es' ? 'Probar' : lang === 'en' ? 'Test' : 'Provar')
            }
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            {lang === 'fr' ? 'Annuler' : lang === 'es' ? 'Cancelar' : lang === 'en' ? 'Cancel' : 'Cancel·lar'}
          </Button>
          <Button
            onClick={saveSettings}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            {lang === 'fr' ? 'Enregistrer' : lang === 'es' ? 'Guardar' : lang === 'en' ? 'Save' : 'Desar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 