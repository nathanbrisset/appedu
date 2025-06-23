"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calculator, Volume2, PenTool, Star, Trophy, Eye, Settings } from "lucide-react"
import ThemedLanguageExercises from "./components/themed-language-exercises"
import MathExercises from "./components/math-exercises"
import ReadingExercises from "./components/reading-exercises"
import WritingExercises from "./components/writing-exercises"
import WritingCorrection from "./components/writing-correction"
import AuthModal from "./components/auth-modal"
import UserProfile from "./components/user-profile"
import { supabase } from './utils/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import VoiceSettings from "./components/voice-settings"

const translations = {
  fr: {
    progress: "Mon Progrès",
    languages: "Langues",
    math: "Mathématiques",
    reading: "Lecture",
    writing: "Écriture",
    heroSection: "J'apprend avec mes héros",
    quickAccess: "Accès rapide :",
    listen: "Écoute du jour",
    story: "Histoire du jour",
    creativeWriting: "Écriture créative",
    quickMath: "Math rapide",
    schoolTitle: "🌟 Mon École Magique 🌟",
    schoolSubtitle: "Apprends en t'amusant !",
    correctWriting: "Corriger mon écriture",
    rewriteSentence: "Réécris cette phrase :",
    sampleSentence: "Le chat dort sur le tapis.",
    writeHere: "Écris ici avec ton crayon...",
    checkWriting: "Vérifier mon écriture",
    clearWriting: "Effacer",
    showAllModules: "Voir tous les modules",
    // Hero names
    captainUnderpants: "Capitaine Superslip",
    hotWheels: "Hot Wheels",
    sonic: "Sonic",
    ninjago: "Ninjago",
    pokemon: "Pokémon",
    minecraft: "Minecraft",
  },
  es: {
    progress: "Mi Progreso",
    languages: "Idiomas",
    math: "Matemáticas",
    reading: "Lectura",
    writing: "Escritura",
    heroSection: "Aprendo con mis héroes",
    quickAccess: "Acceso rápido:",
    listen: "Escucha de hoy",
    story: "Historia de hoy",
    creativeWriting: "Escritura creativa",
    quickMath: "Matemáticas rápidas",
    schoolTitle: "🌟 Mi Escuela Mágica 🌟",
    schoolSubtitle: "¡Aprende divirtiéndote!",
    correctWriting: "Corregir mi escritura",
    rewriteSentence: "Reescribe esta frase:",
    sampleSentence: "El gato duerme en la alfombra.",
    writeHere: "Escribe aquí con tu lápiz...",
    checkWriting: "Verificar mi escritura",
    clearWriting: "Limpiar",
    showAllModules: "Ver todos los módulos",
    // Hero names
    captainUnderpants: "Capitán Calzoncillos",
    hotWheels: "Hot Wheels",
    sonic: "Sonic",
    ninjago: "Ninjago",
    pokemon: "Pokémon",
    minecraft: "Minecraft",
  },
  en: {
    progress: "My Progress",
    languages: "Languages",
    math: "Math",
    reading: "Reading",
    writing: "Writing",
    heroSection: "I Learn with My Heroes",
    quickAccess: "Quick Access:",
    listen: "Today's Listening",
    story: "Today's Story",
    creativeWriting: "Creative Writing",
    quickMath: "Quick Math",
    schoolTitle: "🌟 My Magic School 🌟",
    schoolSubtitle: "Learn while having fun!",
    correctWriting: "Correct my writing",
    rewriteSentence: "Rewrite this sentence:",
    sampleSentence: "The cat sleeps on the carpet.",
    writeHere: "Write here with your pencil...",
    checkWriting: "Check my writing",
    clearWriting: "Clear",
    showAllModules: "Show all modules",
    // Hero names
    captainUnderpants: "Captain Underpants",
    hotWheels: "Hot Wheels",
    sonic: "Sonic",
    ninjago: "Ninjago",
    pokemon: "Pokémon",
    minecraft: "Minecraft",
  },
}

type ProgressRow = {
  id?: string;
  user_id?: string | null;
  device_id: string;
  module: string;
  exercise_type: string;
  value: number;
};

type ProgressType = {
  languages: Record<string, number>;
  math: Record<string, number>;
  reading: Record<string, number>;
  writing: Record<string, number>;
};

export default function HomePage() {
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const [selectedQuickAccess, setSelectedQuickAccess] = useState<string | null>(null)
  const [selectedHero, setSelectedHero] = useState<string | null>(null)
  const [showAllModules, setShowAllModules] = useState(false)
  const [userProgress, setUserProgress] = useState({
    languages: { catalan: 0, french: 0, spanish: 0, english: 0 },
    math: { addition: 0, subtraction: 0, multiplication: 0, division: 0 },
    reading: { beginner: 0, intermediate: 0, advanced: 0 },
    writing: { beginner: 0, intermediate: 0, advanced: 0 },
  })
  const [lang, setLang] = useState<'fr' | 'es' | 'en'>('fr')
  const t = translations[lang]

  // Authentication states
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Writing correction states
  const writingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isWriting, setIsWriting] = useState(false)
  const [writingFeedback, setWritingFeedback] = useState<string | null>(null)
  const [isCheckingWriting, setIsCheckingWriting] = useState(false)

  const [progressLoaded, setProgressLoaded] = useState(false)

  // Voice settings state
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)

  // Get or create device_id
  function getDeviceId(): string {
    let id = localStorage.getItem('device_id')
    if (!id) {
      id = uuidv4()
      localStorage.setItem('device_id', id)
    }
    return id
  }

  // Check authentication status on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch progress from Supabase on mount and when user changes
  useEffect(() => {
    async function fetchProgress() {
      const device_id = getDeviceId()
      let data: any[] = []
      
      if (user) {
        // Fetch user progress
        const { data: userData } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id)
        data = userData || []
      } else {
        // Fetch device progress
        const { data: deviceData } = await supabase
          .from('progress')
          .select('*')
          .eq('device_id', device_id)
        data = deviceData || []
      }
      
      if (data.length > 0) {
        // Start with the default structure
        const newProgress = {
          languages: { catalan: 0, french: 0, spanish: 0, english: 0 },
          math: { addition: 0, subtraction: 0, multiplication: 0, division: 0 },
          reading: { beginner: 0, intermediate: 0, advanced: 0 },
          writing: { beginner: 0, intermediate: 0, advanced: 0 },
        }
        
        data.forEach((row: ProgressRow) => {
          if (row.module && row.exercise_type) {
            const moduleKey = row.module as keyof typeof newProgress
            if (newProgress[moduleKey]) {
              (newProgress[moduleKey] as any)[row.exercise_type] = row.value
            }
          }
        })
        setUserProgress(newProgress)
      }
      setProgressLoaded(true)
    }
    fetchProgress()
    // eslint-disable-next-line
  }, [user])

  // Upsert progress to Supabase
  async function upsertProgress(module: string, exercise_type: string, value: number) {
    const device_id = getDeviceId()
    
    if (user) {
      // Save to user account
      await supabase.from('progress').upsert([
        { user_id: user.id, module, exercise_type, value }
      ], { onConflict: 'user_id,module,exercise_type' })
    } else {
      // Save to device
      await supabase.from('progress').upsert([
        { device_id, module, exercise_type, value }
      ], { onConflict: 'device_id,module,exercise_type' })
    }
  }

  // Update setProgress to sync with Supabase
  function setProgressAndSync(newProgress: any) {
    setUserProgress(newProgress)
    Object.entries(newProgress).forEach(([module, exercises]) => {
      Object.entries(exercises as any).forEach(([exercise_type, value]) => {
        upsertProgress(module, exercise_type, value as number)
      })
    })
  }

  const handleQuickAccess = (module: string) => {
    setSelectedQuickAccess(module)
    setCurrentModule(module)
  }

  const handleHeroClick = (hero: string) => {
    setSelectedHero(hero)
    setCurrentModule("languages")
  }

  // Authentication handlers
  const handleAuthSuccess = (user: any) => {
    setUser(user)
    setShowAuthModal(false)
  }

  const handleSignOut = () => {
    setUser(null)
    // Refresh progress to show device progress
    setProgressLoaded(false)
  }

  // Writing correction functions
  const startWriting = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsWriting(true)
    const canvas = writingCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const write = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isWriting) return

    const canvas = writingCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setWritingFeedback(null)
  }

  const checkWriting = () => {
    setIsCheckingWriting(true)
    setWritingFeedback(null)
    
    // Simulate AI analysis of handwriting
    setTimeout(() => {
      const feedbacks = {
        fr: [
          "Excellent ! Ton écriture est très lisible et bien formée.",
          "Bien joué ! Quelques lettres pourraient être un peu plus nettes.",
          "Continue à t'entraîner, ton écriture s'améliore !"
        ],
        es: [
          "¡Excelente! Tu escritura es muy legible y bien formada.",
          "¡Bien hecho! Algunas letras podrían ser un poco más claras.",
          "¡Sigue practicando, tu escritura está mejorando!"
        ],
        en: [
          "Excellent! Your handwriting is very readable and well-formed.",
          "Well done! Some letters could be a bit clearer.",
          "Keep practicing, your handwriting is improving!"
        ]
      }
      
      const randomFeedback = feedbacks[lang][Math.floor(Math.random() * feedbacks[lang].length)]
      setWritingFeedback(randomFeedback)
      setIsCheckingWriting(false)
      
      // Text-to-speech feedback
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(randomFeedback)
        const langCodes = { fr: "fr-FR", es: "es-ES", en: "en-US" }
        utterance.lang = langCodes[lang]
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }, 2000)
  }

  if (currentModule === "languages") {
    return (
      <ThemedLanguageExercises
        onBack={() => {
          setCurrentModule(null)
          setSelectedQuickAccess(null)
          setSelectedHero(null)
        }}
        progress={userProgress}
        setProgress={setProgressAndSync}
        preSelectedHero={selectedHero}
        lang={lang}
      />
    )
  }

  if (currentModule === "math") {
    return (
      <MathExercises 
        onBack={() => {
          setCurrentModule(null)
          setSelectedQuickAccess(null)
        }} 
        progress={userProgress} 
        setProgress={setProgressAndSync} 
        lang={lang}
        setLang={setLang}
      />
    )
  }

  if (currentModule === "reading") {
    return (
      <ReadingExercises 
        onBack={() => {
          setCurrentModule(null)
          setSelectedQuickAccess(null)
        }} 
        progress={userProgress} 
        setProgress={setProgressAndSync} 
        lang={lang}
        setLang={setLang}
      />
    )
  }

  if (currentModule === "writing") {
    return (
      <WritingExercises 
        onBack={() => {
          setCurrentModule(null)
          setSelectedQuickAccess(null)
        }} 
        progress={userProgress} 
        setProgress={setProgressAndSync} 
        lang={lang}
        setLang={setLang}
      />
    )
  }

  // Show full writing correction page
  if (currentModule === "writingCorrection") {
    return (
      <WritingCorrection 
        onBack={() => setCurrentModule(null)} 
      />
    )
  }

  // Show all modules (original homepage)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end gap-2 mb-2">
          <button onClick={() => setLang('fr')} aria-label="Français" className={lang==='fr'?"opacity-100 scale-110":"opacity-60 hover:opacity-100"} style={{fontSize:'2rem',transition:'all 0.2s'}}>
            🇫🇷
          </button>
          <button onClick={() => setLang('es')} aria-label="Español" className={lang==='es'?"opacity-100 scale-110":"opacity-60 hover:opacity-100"} style={{fontSize:'2rem',transition:'all 0.2s'}}>
            🇪🇸
          </button>
          <button onClick={() => setLang('en')} aria-label="English" className={lang==='en'?"opacity-100 scale-110":"opacity-60 hover:opacity-100"} style={{fontSize:'2rem',transition:'all 0.2s'}}>
            🇬🇧
          </button>
        </div>

        {/* User Profile */}
        <div className="mb-6">
          <UserProfile 
            user={user}
            onSignOut={handleSignOut}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t.schoolTitle}</h1>
          <p className="text-xl text-white/90 drop-shadow">{t.schoolSubtitle}</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-yellow-500" />
              {t.progress}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progressLoaded ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(userProgress.languages).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-sm text-gray-600">{t.languages}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(userProgress.math).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-sm text-gray-600">{t.math}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(userProgress.reading).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-sm text-gray-600">{t.reading}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(userProgress.writing).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-sm text-gray-600">{t.writing}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Main Modules */}
        <div className="grid gap-6">
          {/* Heroes Section - Full Width */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {t.heroSection}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div 
                  className="relative p-6 rounded-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden min-h-[120px] flex items-center justify-center"
                  style={{
                    backgroundImage: 'url(/hero-logos/captain-underpants.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.backgroundColor = '#fecaca';
                    target.style.backgroundImage = 'none';
                  }}
                  onClick={() => handleHeroClick('captainUnderpants')}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                  <div className="relative z-10">
                    <div className="text-base font-medium text-white drop-shadow-lg">{t.captainUnderpants}</div>
                  </div>
                </div>
                <div 
                  className="relative p-6 rounded-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden min-h-[120px] flex items-center justify-center"
                  style={{
                    backgroundImage: 'url(/hero-logos/hot-wheels.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.backgroundColor = '#dbeafe';
                    target.style.backgroundImage = 'none';
                  }}
                  onClick={() => handleHeroClick('hotWheels')}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                  <div className="relative z-10">
                    <div className="text-base font-medium text-white drop-shadow-lg">{t.hotWheels}</div>
                  </div>
                </div>
                <div 
                  className="relative p-6 rounded-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden min-h-[120px] flex items-center justify-center"
                  style={{
                    backgroundImage: 'url(/hero-logos/sonic.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.backgroundColor = '#fef3c7';
                    target.style.backgroundImage = 'none';
                  }}
                  onClick={() => handleHeroClick('sonic')}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                  <div className="relative z-10">
                    <div className="text-base font-medium text-white drop-shadow-lg">{t.sonic}</div>
                  </div>
                </div>
                <div 
                  className="relative p-6 rounded-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden min-h-[120px] flex items-center justify-center"
                  style={{
                    backgroundImage: 'url(/hero-logos/ninjago.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.backgroundColor = '#dcfce7';
                    target.style.backgroundImage = 'none';
                  }}
                  onClick={() => handleHeroClick('ninjago')}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                  <div className="relative z-10">
                    <div className="text-base font-medium text-white drop-shadow-lg">{t.ninjago}</div>
                  </div>
                </div>
                <div 
                  className="relative p-6 rounded-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden min-h-[120px] flex items-center justify-center"
                  style={{
                    backgroundImage: 'url(/hero-logos/pokemon.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.backgroundColor = '#f3e8ff';
                    target.style.backgroundImage = 'none';
                  }}
                  onClick={() => handleHeroClick('pokemon')}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                  <div className="relative z-10">
                    <div className="text-base font-medium text-white drop-shadow-lg">{t.pokemon}</div>
                  </div>
                </div>
                <div 
                  className="relative p-6 rounded-lg text-center cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden min-h-[120px] flex items-center justify-center"
                  style={{
                    backgroundImage: 'url(/hero-logos/minecraft.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.backgroundColor = '#f3f4f6';
                    target.style.backgroundImage = 'none';
                  }}
                  onClick={() => handleHeroClick('minecraft')}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                  <div className="relative z-10">
                    <div className="text-base font-medium text-white drop-shadow-lg">{t.minecraft}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Other Modules - 3 columns */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Reading Module */}
            <Card
              className={`bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 relative ${
                selectedQuickAccess === "reading" ? "ring-4 ring-green-400" : ""
              }`}
              onClick={() => setCurrentModule("reading")}
            >
              {selectedQuickAccess === "reading" && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  🏁
                </div>
              )}
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">{t.reading}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <span className="text-lg">📚</span>
                    <span className="ml-2 font-medium">Histoires</span>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="text-lg">❓</span>
                    <span className="ml-2 font-medium">Questions</span>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-lg">🎧</span>
                    <span className="ml-2 font-medium">Audio</span>
                  </div>
                </div>
                <div className="flex justify-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>Compréhension</span>
                </div>
              </CardContent>
            </Card>
            {/* Writing Module */}
            <Card
              className={`bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 relative ${
                selectedQuickAccess === "writing" ? "ring-4 ring-orange-400" : ""
              }`}
              onClick={() => setCurrentModule("writing")}
            >
              {selectedQuickAccess === "writing" && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  🏁
                </div>
              )}
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                  <PenTool className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">{t.writing}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <span className="text-lg">✍️</span>
                    <span className="ml-2 font-medium">Créativité</span>
                  </div>
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <span className="text-lg">💡</span>
                    <span className="ml-2 font-medium">Conseils</span>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <span className="text-lg">⭐</span>
                    <span className="ml-2 font-medium">Évaluation</span>
                  </div>
                </div>
                <div className="flex justify-center gap-2 text-sm text-gray-600">
                  <PenTool className="h-4 w-4" />
                  <span>Expression</span>
                </div>
              </CardContent>
            </Card>
            {/* Math Module */}
            <Card
              className={`bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 relative ${
                selectedQuickAccess === "math" ? "ring-4 ring-purple-400" : ""
              }`}
              onClick={() => setCurrentModule("math")}
            >
              {selectedQuickAccess === "math" && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  🏁
                </div>
              )}
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">{t.math}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <span className="text-lg">➕</span>
                    <span className="ml-2 font-medium">Additions</span>
                  </div>
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <span className="text-lg">➖</span>
                    <span className="ml-2 font-medium">Soustractions</span>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-lg">✖️</span>
                    <span className="ml-2 font-medium">Multiplication</span>
                  </div>
                </div>
                <div className="flex justify-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4" />
                  <span>Calcul mental</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Writing Correction CTA */}
        <Card className="mt-8 mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="text-3xl">✏️</span>
                  <h2 className="text-2xl font-bold">{t.correctWriting}</h2>
                </div>
                <p className="text-white/90 text-lg">
                  {lang === 'fr' && "Améliore ton écriture avec l'IA !"}
                  {lang === 'es' && "¡Mejora tu escritura con IA!"}
                  {lang === 'en' && "Improve your handwriting with AI!"}
                </p>
              </div>
              <Button 
                onClick={() => setCurrentModule("writingCorrection")}
                className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-3 font-semibold shadow-lg"
              >
                {lang === 'fr' && "Commencer ✨"}
                {lang === 'es' && "Comenzar ✨"}
                {lang === 'en' && "Start ✨"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Buttons */}
        <div className="mt-8 text-center">
          <p className="text-white/80 mb-4">{t.quickAccess}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className={`${
                selectedQuickAccess === "languages" 
                  ? "bg-blue-500 hover:bg-blue-600 border-blue-400" 
                  : "bg-white/20 hover:bg-white/30 border-white/30"
              } text-white relative`}
              onClick={() => handleQuickAccess("languages")}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              {t.listen}
              {selectedQuickAccess === "languages" && (
                <span className="absolute -top-2 -right-2 text-lg">🏁</span>
              )}
            </Button>
            <Button
              className={`${
                selectedQuickAccess === "reading" 
                  ? "bg-green-500 hover:bg-green-600 border-green-400" 
                  : "bg-white/20 hover:bg-white/30 border-white/30"
              } text-white relative`}
              onClick={() => handleQuickAccess("reading")}
            >
              <Eye className="h-4 w-4 mr-2" />
              {t.story}
              {selectedQuickAccess === "reading" && (
                <span className="absolute -top-2 -right-2 text-lg">🏁</span>
              )}
            </Button>
            <Button
              className={`${
                selectedQuickAccess === "writing" 
                  ? "bg-orange-500 hover:bg-orange-600 border-orange-400" 
                  : "bg-white/20 hover:bg-white/30 border-white/30"
              } text-white relative`}
              onClick={() => handleQuickAccess("writing")}
            >
              <PenTool className="h-4 w-4 mr-2" />
              {t.creativeWriting}
              {selectedQuickAccess === "writing" && (
                <span className="absolute -top-2 -right-2 text-lg">🏁</span>
              )}
            </Button>
            <Button
              className={`${
                selectedQuickAccess === "math" 
                  ? "bg-purple-500 hover:bg-purple-600 border-purple-400" 
                  : "bg-white/20 hover:bg-white/30 border-white/30"
              } text-white relative`}
              onClick={() => handleQuickAccess("math")}
            >
              <Calculator className="h-4 w-4 mr-2" />
              {t.quickMath}
              {selectedQuickAccess === "math" && (
                <span className="absolute -top-2 -right-2 text-lg">🏁</span>
              )}
            </Button>
          </div>
        </div>

        {/* Voice Settings Button */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setShowVoiceSettings(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-3 shadow-lg"
            size="sm"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Voice Settings Modal */}
        {showVoiceSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <VoiceSettings
              lang={lang}
              onClose={() => setShowVoiceSettings(false)}
            />
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        deviceProgress={userProgress}
      />
    </div>
  )
}
