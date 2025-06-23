"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, PenTool, Check, Star, Save, RotateCcw, Sparkles, BookOpen } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface WritingExercisesProps {
  onBack: () => void
  progress: any
  setProgress: (progress: any) => void
}

const writingPrompts = {
  beginner: [
    {
      title: "Mon Animal Préféré",
      prompt: "Décris ton animal préféré. Comment s'appelle-t-il ? De quelle couleur est-il ? Que fait-il ?",
      hints: ["Nom de l'animal", "Couleur", "Ce qu'il fait"],
      theme: "animals",
      emoji: "🐾",
      wordCount: 30
    },
    {
      title: "Ma Famille",
      prompt: "Parle de ta famille. Qui sont les membres de ta famille ? Que faites-vous ensemble ?",
      hints: ["Noms des membres", "Activités ensemble"],
      theme: "family",
      emoji: "👨‍👩‍👧‍👦",
      wordCount: 40
    },
    {
      title: "Mon Jouet Préféré",
      prompt: "Décris ton jouet préféré. À quoi ressemble-t-il ? Avec quoi joues-tu ?",
      hints: ["Description du jouet", "Comment tu joues"],
      theme: "toys",
      emoji: "🧸",
      wordCount: 35
    }
  ],
  intermediate: [
    {
      title: "Une Aventure Magique",
      prompt: "Imagine que tu découvres un objet magique. Que se passe-t-il ? Où vas-tu ? Que fais-tu ?",
      hints: ["L'objet magique", "L'aventure", "La fin"],
      theme: "fantasy",
      emoji: "✨",
      wordCount: 80
    },
    {
      title: "Mon Héros",
      prompt: "Décris ton héros préféré. Pourquoi l'admires-tu ? Que ferais-tu si tu le rencontrais ?",
      hints: ["Qui est ton héros", "Pourquoi tu l'admires", "Si tu le rencontrais"],
      theme: "heroes",
      emoji: "🦸‍♂️",
      wordCount: 70
    },
    {
      title: "Un Voyage Extraordinaire",
      prompt: "Si tu pouvais voyager n'importe où, où irais-tu ? Que ferais-tu là-bas ?",
      hints: ["La destination", "Ce que tu ferais", "Pourquoi ce lieu"],
      theme: "travel",
      emoji: "✈️",
      wordCount: 75
    }
  ],
  advanced: [
    {
      title: "Une Histoire de Mystère",
      prompt: "Écris une courte histoire de mystère. Quelqu'un a disparu ou quelque chose a été volé. Que se passe-t-il ?",
      hints: ["Le mystère", "Les personnages", "La solution"],
      theme: "mystery",
      emoji: "🔍",
      wordCount: 120
    },
    {
      title: "Le Monde de Demain",
      prompt: "Imagine le monde dans 50 ans. Comment sera la vie ? Quelles nouvelles technologies existeront ?",
      hints: ["Les technologies", "La vie quotidienne", "Les changements"],
      theme: "future",
      emoji: "🚀",
      wordCount: 100
    },
    {
      title: "Une Amitié Spéciale",
      prompt: "Raconte l'histoire d'une amitié entre deux personnages très différents. Comment se sont-ils rencontrés ?",
      hints: ["Les personnages", "La rencontre", "L'amitié"],
      theme: "friendship",
      emoji: "🤝",
      wordCount: 110
    }
  ]
}

const writingTips = {
  beginner: [
    "Utilise des mots simples",
    "Fais des phrases courtes",
    "Décris ce que tu vois",
    "Utilise tes sens (voir, entendre, toucher)"
  ],
  intermediate: [
    "Ajoute des détails",
    "Utilise des connecteurs (et, mais, parce que)",
    "Décris les émotions",
    "Fais des comparaisons"
  ],
  advanced: [
    "Structure ton texte (début, milieu, fin)",
    "Utilise un vocabulaire varié",
    "Ajoute du dialogue",
    "Crée de la tension ou de l'émotion"
  ]
}

export default function WritingExercises({ onBack, progress, setProgress }: WritingExercisesProps) {
  const [currentLevel, setCurrentLevel] = useState<string | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [userText, setUserText] = useState("")
  const [showTips, setShowTips] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [evaluation, setEvaluation] = useState({ score: 0, feedback: "" })

  const startWriting = (level: string) => {
    setCurrentLevel(level)
    setCurrentPrompt(0)
    setUserText("")
    setShowTips(false)
    setShowEvaluation(false)
  }

  const evaluateWriting = () => {
    const currentPromptData = writingPrompts[currentLevel as keyof typeof writingPrompts][currentPrompt]
    const wordCount = userText.split(/\s+/).filter(word => word.length > 0).length
    const targetWords = currentPromptData.wordCount
    
    let score = 0
    let feedback = ""

    // Word count evaluation
    if (wordCount >= targetWords * 0.8) {
      score += 30
      feedback += "✅ Bon nombre de mots. "
    } else {
      feedback += "⚠️ Essaie d'écrire un peu plus. "
    }

    // Content evaluation (basic)
    if (userText.length > 50) {
      score += 40
      feedback += "✅ Bon contenu développé. "
    } else {
      feedback += "⚠️ Développe davantage tes idées. "
    }

    // Creativity bonus
    if (userText.includes("parce que") || userText.includes("mais") || userText.includes("et")) {
      score += 20
      feedback += "✅ Bon usage des connecteurs. "
    }

    // Completion bonus
    if (userText.trim().length > 0) {
      score += 10
      feedback += "✅ Exercice complété ! "
    }

    setEvaluation({ score: Math.min(score, 100), feedback })
    setShowEvaluation(true)

    // Update progress
    const newProgress = { ...progress }
    if (!newProgress.writing) newProgress.writing = { beginner: 0, intermediate: 0, advanced: 0 }
    newProgress.writing[currentLevel as keyof typeof newProgress.writing] += score
    setProgress(newProgress)
  }

  const nextPrompt = () => {
    const prompts = writingPrompts[currentLevel as keyof typeof writingPrompts]
    if (currentPrompt < prompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1)
      setUserText("")
      setShowTips(false)
      setShowEvaluation(false)
    } else {
      setCurrentLevel(null)
    }
  }

  const wordCount = userText.split(/\s+/).filter(word => word.length > 0).length

  if (currentLevel && writingPrompts[currentLevel as keyof typeof writingPrompts]) {
    const prompts = writingPrompts[currentLevel as keyof typeof writingPrompts]
    const currentPromptData = prompts[currentPrompt]

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button onClick={() => setCurrentLevel(null)} variant="outline" className="bg-white/20 text-white border-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">✍️ Écriture</h1>
            <div className="text-white font-semibold">
              Niveau: {currentLevel === 'beginner' ? 'Débutant' : currentLevel === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
            </div>
          </div>

          {/* Writing Prompt Card */}
          <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="text-4xl">{currentPromptData.emoji}</span>
                {currentPromptData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-lg leading-relaxed text-gray-800">
                  <strong>Consigne :</strong> {currentPromptData.prompt}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-medium text-blue-800 mb-2">💡 Indices :</div>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    {currentPromptData.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={() => setShowTips(!showTips)}
                    variant="outline"
                    className="border-blue-300 text-blue-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Conseils d'écriture
                  </Button>
                  
                  <div className="text-sm text-gray-600 flex items-center">
                    📝 Objectif: {currentPromptData.wordCount} mots (actuel: {wordCount})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writing Tips */}
          {showTips && (
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-xl text-yellow-800">💡 Conseils pour bien écrire</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-yellow-700 space-y-2">
                  {writingTips[currentLevel as keyof typeof writingTips].map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Writing Area */}
          <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Ton texte</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Commence à écrire ici..."
                className="min-h-[300px] text-lg leading-relaxed resize-none"
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  {wordCount} mots écrits
                </div>
                
                <Button 
                  onClick={evaluateWriting}
                  disabled={userText.trim().length === 0}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Évaluer mon texte
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          {showEvaluation && (
            <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Évaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {evaluation.score >= 80 ? '🎉' : evaluation.score >= 60 ? '👍' : '💪'}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    Score: {evaluation.score}/100
                  </div>
                  <div className="text-gray-700 mb-4 text-left">
                    {evaluation.feedback}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => {
                        setUserText("")
                        setShowEvaluation(false)
                      }}
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Recommencer
                    </Button>
                    
                    <Button 
                      onClick={nextPrompt}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Exercice suivant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div className="text-center text-white">
            <div className="text-lg">
              Exercice {currentPrompt + 1} sur {prompts.length}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <Button onClick={onBack} variant="outline" className="absolute top-8 left-8 bg-white/20 text-white border-white/30">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">✍️ Écriture</h1>
          <p className="text-xl text-white/90 drop-shadow">Développe ta créativité !</p>
        </div>

        {/* Level Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => startWriting('beginner')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Débutant</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>• Descriptions simples</div>
                <div>• Phrases courtes</div>
                <div>• 30-40 mots</div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => startWriting('intermediate')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Intermédiaire</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>• Histoires courtes</div>
                <div>• Connecteurs logiques</div>
                <div>• 70-80 mots</div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => startWriting('advanced')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Avancé</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>• Histoires complètes</div>
                <div>• Vocabulaire riche</div>
                <div>• 100-120 mots</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mt-8 bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Star className="h-6 w-6 text-yellow-500" />
              Mes Progrès en Écriture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {progress?.writing?.beginner || 0}
                </div>
                <div className="text-sm text-gray-600">Débutant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {progress?.writing?.intermediate || 0}
                </div>
                <div className="text-sm text-gray-600">Intermédiaire</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {progress?.writing?.advanced || 0}
                </div>
                <div className="text-sm text-gray-600">Avancé</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 