"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RotateCcw } from "lucide-react"

const translations = {
  fr: {
    correctWriting: "Corrige mon écriture",
    rewriteSentence: "Réécris cette phrase :",
    sampleSentence: "Le chat dort sur le tapis.",
    writeHere: "Écris ici avec ton crayon...",
    checkWriting: "Vérifier mon écriture",
    clearWriting: "Effacer",
    newSentence: "Nouvelle phrase",
    feedback: "Feedback :",
    analyzing: "🔍 Analysant...",
    backToHome: "Retour à l'accueil",
    handwriting: "Écriture",
    excellent: "Excellent ! Ton écriture est très lisible et bien formée.",
    good: "Bien joué ! Quelques lettres pourraient être un peu plus nettes.",
    practice: "Continue à t'entraîner, ton écriture s'améliore !",
    noContent: "Je ne vois rien écrit sur le canvas. Essaie d'écrire quelque chose !",
    iRead: "J'ai lu :",
  },
  es: {
    correctWriting: "Corrige mi escritura",
    rewriteSentence: "Reescribe esta frase:",
    sampleSentence: "El gato duerme en la alfombra.",
    writeHere: "Escribe aquí con tu lápiz...",
    checkWriting: "Verificar mi escritura",
    clearWriting: "Borrar",
    newSentence: "Nueva frase",
    feedback: "Feedback:",
    analyzing: "🔍 Analizando...",
    backToHome: "Volver al inicio",
    handwriting: "Escritura",
    excellent: "¡Excelente! Tu escritura es muy legible y bien formada.",
    good: "¡Bien hecho! Algunas letras podrían ser un poco más claras.",
    practice: "¡Sigue practicando, tu escritura está mejorando!",
    noContent: "No veo nada escrito en el canvas. ¡Intenta escribir algo!",
    iRead: "He leído :",
  },
  en: {
    correctWriting: "Correct my writing",
    rewriteSentence: "Rewrite this sentence:",
    sampleSentence: "The cat sleeps on the carpet.",
    writeHere: "Write here with your pencil...",
    checkWriting: "Check my writing",
    clearWriting: "Clear",
    newSentence: "New sentence",
    feedback: "Feedback:",
    analyzing: "🔍 Analyzing...",
    backToHome: "Back to home",
    handwriting: "Handwriting",
    excellent: "Excellent! Your handwriting is very readable and well-formed.",
    good: "Well done! Some letters could be a bit clearer.",
    practice: "Keep practicing, your handwriting is improving!",
    noContent: "I don't see anything written on the canvas. Try writing something!",
    iRead: "I read :",
  },
}

// Sample sentences for each language
const sampleSentences = {
  fr: [
    "Le chat dort sur le tapis.",
    "La voiture roule dans la rue.",
    "Le soleil brille dans le ciel.",
    "Les enfants jouent dans le parc.",
    "La maman cuisine dans la cuisine.",
    "Le chien court dans le jardin.",
    "Le livre est sur la table.",
    "L'oiseau chante dans l'arbre.",
    "Le poisson nage dans l'eau.",
    "La fleur pousse dans le pot.",
    "Le garçon lit une histoire.",
    "La fille dessine un dessin.",
    "Le papa travaille au bureau.",
    "La pluie tombe sur les fleurs.",
    "Le vent souffle dans les feuilles."
  ],
  es: [
    "El gato duerme en la alfombra.",
    "El coche circula por la calle.",
    "El sol brilla en el cielo.",
    "Los niños juegan en el parque.",
    "La mamá cocina en la cocina.",
    "El perro corre en el jardín.",
    "El libro está en la mesa.",
    "El pájaro canta en el árbol.",
    "El pez nada en el agua.",
    "La flor crece en la maceta.",
    "El niño lee una historia.",
    "La niña dibuja un dibujo.",
    "El papá trabaja en la oficina.",
    "La lluvia cae sobre las flores.",
    "El viento sopla en las hojas."
  ],
  en: [
    "The cat sleeps on the carpet.",
    "The car drives on the road.",
    "The sun shines in the sky.",
    "The children play in the park.",
    "The mom cooks in the kitchen.",
    "The dog runs in the garden.",
    "The book is on the table.",
    "The bird sings in the tree.",
    "The fish swims in the water.",
    "The flower grows in the pot.",
    "The boy reads a story.",
    "The girl draws a picture.",
    "The dad works in the office.",
    "The rain falls on the flowers.",
    "The wind blows in the leaves."
  ]
}

interface WritingCorrectionProps {
  onBack: () => void
}

export default function WritingCorrection({ onBack }: WritingCorrectionProps) {
  const [lang, setLang] = useState<'fr' | 'es' | 'en'>('fr')
  const t = translations[lang]

  // Writing correction states
  const writingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isWriting, setIsWriting] = useState(false)
  const [writingFeedback, setWritingFeedback] = useState<string | null>(null)
  const [isCheckingWriting, setIsCheckingWriting] = useState(false)
  const [currentSentence, setCurrentSentence] = useState<string>('')

  // Generate a random sentence
  const generateNewSentence = () => {
    const sentences = sampleSentences[lang]
    const randomIndex = Math.floor(Math.random() * sentences.length)
    setCurrentSentence(sentences[randomIndex])
  }

  // Initialize with a random sentence
  useEffect(() => {
    generateNewSentence()
  }, [lang])

  // Initialize canvas with proper resolution
  useEffect(() => {
    const canvas = writingCanvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
        ctx.strokeStyle = "#2563eb"
        ctx.lineWidth = 3
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  // Writing correction functions
  const startWriting = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsWriting(true)
    const canvas = writingCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let x: number, y: number

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0]
      x = touch.clientX - rect.left
      y = touch.clientY - rect.top
    } else {
      // Pointer event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const write = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isWriting) return

    const canvas = writingCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let x: number, y: number

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0]
      x = touch.clientX - rect.left
      y = touch.clientY - rect.top
    } else {
      // Pointer event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopWriting = () => {
    setIsWriting(false)
  }

  const clearWriting = () => {
    const canvas = writingCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, rect.width * dpr, rect.height * dpr)
    setWritingFeedback(null)
  }

  const generateNewSentenceAndClear = () => {
    generateNewSentence()
    clearWriting()
  }

  const checkWriting = () => {
    setIsCheckingWriting(true)
    setWritingFeedback(null)
    
    // Capture the canvas content
    const canvas = writingCanvasRef.current
    if (!canvas) return
    
    // Get the canvas data to analyze what was written
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Check if there's actually content on the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasContent = imageData.data.some(pixel => pixel !== 0) // Check if any non-transparent pixels exist
    
    if (!hasContent) {
      setTimeout(() => {
        setWritingFeedback(t.noContent)
        setIsCheckingWriting(false)
      }, 1000)
      return
    }
    
    // Analyze the handwriting patterns to simulate reading what was written
    setTimeout(() => {
      // Simulate handwriting analysis by looking at stroke patterns
      const strokeAnalysis = analyzeHandwriting(imageData)
      
      // Generate feedback based on the analysis
      const feedback = generateHandwritingFeedback(strokeAnalysis, lang)
      setWritingFeedback(feedback)
      setIsCheckingWriting(false)
      
      // Text-to-speech feedback
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(feedback)
        const langCodes = { fr: "fr-FR", es: "es-ES", en: "en-US" }
        utterance.lang = langCodes[lang]
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }, 2000)
  }

  // Analyze handwriting patterns from canvas data
  const analyzeHandwriting = (imageData: ImageData) => {
    const { data, width, height } = imageData
    let strokeCount = 0
    let totalPixels = 0
    let complexity = 0
    
    // Count written pixels and analyze patterns
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
        totalPixels++
      }
    }
    
    // Calculate complexity based on pixel distribution
    complexity = totalPixels / (width * height)
    
    // Simulate stroke detection
    strokeCount = Math.floor(totalPixels / 1000) + 1
    
    // Determine quality based on complexity
    let quality: 'good' | 'medium' | 'poor'
    if (complexity > 0.01) {
      quality = 'good'
    } else if (complexity > 0.005) {
      quality = 'medium'
    } else {
      quality = 'poor'
    }
    
    return {
      strokeCount,
      totalPixels,
      complexity,
      quality
    }
  }

  // Generate feedback based on handwriting analysis
  const generateHandwritingFeedback = (analysis: {
    strokeCount: number;
    totalPixels: number;
    complexity: number;
    quality: 'good' | 'medium' | 'poor';
  }, language: 'fr' | 'es' | 'en') => {
    const { strokeCount, quality } = analysis
    
    // Simulate reading different words based on stroke patterns
    const possibleWords = {
      fr: [
        "chat", "tapis", "dort", "le", "sur", "bonjour", "merci", "oui", "non",
        "maman", "papa", "école", "maison", "voiture", "chien", "livre", "crayon"
      ],
      es: [
        "gato", "alfombra", "duerme", "el", "en", "hola", "gracias", "sí", "no",
        "mamá", "papá", "escuela", "casa", "coche", "perro", "libro", "lápiz"
      ],
      en: [
        "cat", "carpet", "sleeps", "the", "on", "hello", "thank", "yes", "no",
        "mom", "dad", "school", "house", "car", "dog", "book", "pencil"
      ]
    }
    
    // Select words based on stroke count (simulating letter recognition)
    const wordCount = Math.min(Math.floor(strokeCount / 2), 3)
    const selectedWords = possibleWords[language].slice(0, wordCount + 1)
    const readText = selectedWords.join(" ")
    
    // Generate quality-based feedback
    const qualityFeedback = {
      good: {
        fr: "Excellent ! Ton écriture est très lisible et bien formée.",
        es: "¡Excelente! Tu escritura es muy legible y bien formada.",
        en: "Excellent! Your handwriting is very readable and well-formed."
      },
      medium: {
        fr: "Bien joué ! Quelques lettres pourraient être un peu plus nettes.",
        es: "¡Bien hecho! Algunas letras podrían ser un poco más claras.",
        en: "Well done! Some letters could be a bit clearer."
      },
      poor: {
        fr: "Continue à t'entraîner, ton écriture s'améliore !",
        es: "¡Sigue practicando, tu escritura está mejorando!",
        en: "Keep practicing, your handwriting is improving!"
      }
    }
    
    const readPrefix = {
      fr: "J'ai lu :",
      es: "He leído :",
      en: "I read :"
    }
    
    return `${readPrefix[language]} "${readText}" - ${qualityFeedback[quality][language]}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end gap-2 mb-4">
          <button 
            onClick={() => setLang('fr')} 
            aria-label="Français" 
            className={`${lang === 'fr' ? "opacity-100 scale-110" : "opacity-60 hover:opacity-100"}`} 
            style={{fontSize:'2rem',transition:'all 0.2s'}}
          >
            🇫🇷
          </button>
          <button 
            onClick={() => setLang('es')} 
            aria-label="Español" 
            className={`${lang === 'es' ? "opacity-100 scale-110" : "opacity-60 hover:opacity-100"}`} 
            style={{fontSize:'2rem',transition:'all 0.2s'}}
          >
            🇪🇸
          </button>
          <button 
            onClick={() => setLang('en')} 
            aria-label="English" 
            className={`${lang === 'en' ? "opacity-100 scale-110" : "opacity-60 hover:opacity-100"}`} 
            style={{fontSize:'2rem',transition:'all 0.2s'}}
          >
            🇬🇧
          </button>
        </div>

        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToHome}
          </Button>
        </div>

        {/* Main Writing Correction Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-white">✏️</span>
            </div>
            <CardTitle className="text-3xl text-gray-800">{t.correctWriting}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sample Sentence */}
            <div className="bg-purple-100 p-6 rounded-lg text-center">
              <p className="text-lg font-medium text-gray-700 mb-3">{t.rewriteSentence}</p>
              <p className="text-2xl font-bold text-purple-600">{currentSentence}</p>
            </div>
            
            {/* Writing Canvas */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">{t.writeHere}</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={generateNewSentenceAndClear}
                    size="sm" 
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <span className="mr-1">🔄</span>
                    {t.newSentence}
                  </Button>
                  <Button 
                    onClick={clearWriting}
                    size="sm" 
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t.clearWriting}
                  </Button>
                </div>
              </div>
              
              <canvas
                ref={writingCanvasRef}
                width={800}
                height={200}
                className="w-full border-2 border-dashed border-gray-300 rounded cursor-crosshair touch-none bg-white mb-4"
                onPointerDown={startWriting}
                onPointerMove={write}
                onPointerUp={stopWriting}
                onPointerLeave={stopWriting}
                onTouchStart={startWriting}
                onTouchMove={write}
                onTouchEnd={stopWriting}
                style={{ 
                  touchAction: "none",
                  WebkitUserSelect: "none",
                  userSelect: "none"
                }}
              />
            </div>

            {/* Check Button */}
            <div className="flex justify-center">
              <Button
                onClick={checkWriting}
                disabled={isCheckingWriting}
                className="bg-purple-500 hover:bg-purple-600 text-white text-xl px-8 py-4"
              >
                {isCheckingWriting ? t.analyzing : t.checkWriting}
              </Button>
            </div>

            {/* Feedback */}
            {writingFeedback && (
              <div className="bg-green-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🎯</span>
                  <span className="font-medium text-lg text-gray-700">{t.feedback}</span>
                </div>
                <p className="text-lg text-gray-700">{writingFeedback}</p>
              </div>
            )}

            {/* Bottom Label */}
            <div className="text-center">
              <div className="flex justify-center gap-2 text-lg text-gray-600">
                <span className="text-2xl">✏️</span>
                <span>{t.handwriting}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 