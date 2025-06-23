"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calculator, Volume2, PenTool, Star, Trophy, Eye } from "lucide-react"
import ThemedLanguageExercises from "./components/themed-language-exercises"
import MathExercises from "./components/math-exercises"
import ReadingExercises from "./components/reading-exercises"
import WritingExercises from "./components/writing-exercises"

export default function HomePage() {
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const [selectedQuickAccess, setSelectedQuickAccess] = useState<string | null>(null)
  const [selectedHero, setSelectedHero] = useState<string | null>(null)
  const [userProgress, setUserProgress] = useState({
    languages: { catalan: 0, french: 0, spanish: 0, english: 0 },
    math: { addition: 0, subtraction: 0, multiplication: 0, division: 0 },
    reading: { beginner: 0, intermediate: 0, advanced: 0 },
    writing: { beginner: 0, intermediate: 0, advanced: 0 },
  })

  const handleQuickAccess = (module: string) => {
    setSelectedQuickAccess(module)
    setCurrentModule(module)
  }

  const handleHeroClick = (hero: string) => {
    setSelectedHero(hero)
    setCurrentModule("languages")
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
        setProgress={setUserProgress}
        preSelectedHero={selectedHero}
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
        setProgress={setUserProgress} 
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
        setProgress={setUserProgress} 
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
        setProgress={setUserProgress} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">🌟 Mon École Magique 🌟</h1>
          <p className="text-xl text-white/90 drop-shadow">Apprends en t'amusant !</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Mes Progrès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(userProgress.languages).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-gray-600">Langues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(userProgress.math).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-gray-600">Maths</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(userProgress.reading).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-gray-600">Lecture</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.values(userProgress.writing).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-gray-600">Écriture</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Modules */}
        <div className="grid gap-6">
          {/* Heroes Section - Full Width */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="text-2xl">🦸‍♂️</span>
                J'apprend avec mes héros
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
                    <div className="text-base font-medium text-white drop-shadow-lg">Capitaine Superslip</div>
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
                    <div className="text-base font-medium text-white drop-shadow-lg">Hot Wheels</div>
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
                    <div className="text-base font-medium text-white drop-shadow-lg">Sonic</div>
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
                    <div className="text-base font-medium text-white drop-shadow-lg">Ninjago</div>
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
                    <div className="text-base font-medium text-white drop-shadow-lg">Pokémon</div>
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
                    <div className="text-base font-medium text-white drop-shadow-lg">Minecraft</div>
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
                <CardTitle className="text-xl text-gray-800">Lecture</CardTitle>
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
                <CardTitle className="text-xl text-gray-800">Écriture</CardTitle>
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
                <CardTitle className="text-xl text-gray-800">Mathématiques</CardTitle>
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

        {/* Quick Access Buttons */}
        <div className="mt-8 text-center">
          <p className="text-white/80 mb-4">Accès rapide :</p>
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
              Écoute du jour
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
              Histoire du jour
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
              Écriture créative
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
              Calcul rapide
              {selectedQuickAccess === "math" && (
                <span className="absolute -top-2 -right-2 text-lg">🏁</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
