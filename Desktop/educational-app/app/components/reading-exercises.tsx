"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Volume2, Check, BookOpen, RotateCcw, Star, Eye, Book } from "lucide-react"

interface ReadingExercisesProps {
  onBack: () => void
  progress: any
  setProgress: (progress: any) => void
}

const readingStories = {
  beginner: [
    {
      title: "Le Petit Chat Curieux",
      text: "Il était une fois un petit chat nommé Mimi. Mimi aimait explorer le jardin derrière sa maison. Un jour, elle découvrit une souris qui jouait près du potager.",
      questions: [
        { question: "Comment s'appelle le petit chat?", answer: "Mimi" },
        { question: "Où Mimi aimait-elle explorer?", answer: "le jardin" },
        { question: "Qu'est-ce que Mimi découvrit?", answer: "une souris" }
      ],
      theme: "animals",
      emoji: "🐱"
    },
    {
      title: "L'Aventure de Tom le Robot",
      text: "Tom était un petit robot qui vivait dans une ville futuriste. Il avait des yeux bleus brillants et des mains en métal. Tom aimait aider les autres robots.",
      questions: [
        { question: "Comment s'appelle le robot?", answer: "Tom" },
        { question: "De quelle couleur étaient ses yeux?", answer: "bleus" },
        { question: "Que faisait Tom?", answer: "aidait les autres robots" }
      ],
      theme: "robots",
      emoji: "🤖"
    }
  ],
  intermediate: [
    {
      title: "La Forêt Enchantée",
      text: "Dans une forêt mystérieuse, vivait une famille de lapins magiques. Les arbres parlaient et les fleurs chantaient. Un jour, un petit lapin blanc découvrit un livre ancien sous un grand chêne.",
      questions: [
        { question: "Qui vivait dans la forêt?", answer: "une famille de lapins magiques" },
        { question: "Que faisaient les arbres?", answer: "ils parlaient" },
        { question: "Que découvrit le petit lapin?", answer: "un livre ancien" }
      ],
      theme: "fantasy",
      emoji: "🌳"
    },
    {
      title: "Le Voyage Spatial",
      text: "L'astronaute Sarah regardait par la fenêtre de sa navette spatiale. Elle voyait la Terre, bleue et belle, depuis l'espace. Les étoiles brillaient comme des diamants dans le ciel noir.",
      questions: [
        { question: "Comment s'appelle l'astronaute?", answer: "Sarah" },
        { question: "Que voyait-elle par la fenêtre?", answer: "la Terre" },
        { question: "À quoi ressemblaient les étoiles?", answer: "des diamants" }
      ],
      theme: "space",
      emoji: "🚀"
    }
  ],
  advanced: [
    {
      title: "Le Mystère du Château",
      text: "Le jeune détective Lucas marchait dans les couloirs sombres du château abandonné. Des bruits étranges résonnaient dans les murs. Soudain, il trouva une vieille clé en or cachée derrière un tableau.",
      questions: [
        { question: "Quel était le métier de Lucas?", answer: "détective" },
        { question: "Où se trouvait Lucas?", answer: "dans un château abandonné" },
        { question: "Que trouva Lucas?", answer: "une vieille clé en or" }
      ],
      theme: "mystery",
      emoji: "🏰"
    }
  ]
}

export default function ReadingExercises({ onBack, progress, setProgress }: ReadingExercisesProps) {
  const [currentLevel, setCurrentLevel] = useState<string | null>(null)
  const [currentStory, setCurrentStory] = useState(0)
  const [showQuestions, setShowQuestions] = useState(false)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-FR'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const startReading = (level: string) => {
    setCurrentLevel(level)
    setCurrentStory(0)
    setShowQuestions(false)
    setUserAnswers([])
    setScore(0)
    setShowResults(false)
  }

  const checkAnswers = () => {
    const currentStoryData = readingStories[currentLevel as keyof typeof readingStories][currentStory]
    let correctAnswers = 0
    
    userAnswers.forEach((answer, index) => {
      if (answer.toLowerCase().includes(currentStoryData.questions[index].answer.toLowerCase())) {
        correctAnswers++
      }
    })

    const newScore = Math.round((correctAnswers / currentStoryData.questions.length) * 100)
    setScore(newScore)
    setShowResults(true)

    // Update progress
    const newProgress = { ...progress }
    if (!newProgress.reading) newProgress.reading = { beginner: 0, intermediate: 0, advanced: 0 }
    newProgress.reading[currentLevel as keyof typeof newProgress.reading] += newScore
    setProgress(newProgress)
  }

  const nextStory = () => {
    const stories = readingStories[currentLevel as keyof typeof readingStories]
    if (currentStory < stories.length - 1) {
      setCurrentStory(currentStory + 1)
      setShowQuestions(false)
      setUserAnswers([])
      setShowResults(false)
    } else {
      setCurrentLevel(null)
    }
  }

  if (currentLevel && readingStories[currentLevel as keyof typeof readingStories]) {
    const stories = readingStories[currentLevel as keyof typeof readingStories]
    const currentStoryData = stories[currentStory]

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button onClick={() => setCurrentLevel(null)} variant="outline" className="bg-white/20 text-white border-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">📚 Lecture</h1>
            <div className="text-white font-semibold">
              Niveau: {currentLevel === 'beginner' ? 'Débutant' : currentLevel === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
            </div>
          </div>

          {/* Story Card */}
          <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="text-4xl">{currentStoryData.emoji}</span>
                {currentStoryData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg leading-relaxed mb-6 text-gray-800">
                {currentStoryData.text}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => speakText(currentStoryData.text)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Écouter l'histoire
                </Button>
                
                {!showQuestions && (
                  <Button 
                    onClick={() => setShowQuestions(true)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir les questions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          {showQuestions && !showResults && (
            <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Questions de compréhension</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentStoryData.questions.map((q, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-lg font-medium text-gray-800">
                        {index + 1}. {q.question}
                      </label>
                      <input
                        type="text"
                        value={userAnswers[index] || ''}
                        onChange={(e) => {
                          const newAnswers = [...userAnswers]
                          newAnswers[index] = e.target.value
                          setUserAnswers(newAnswers)
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Votre réponse..."
                      />
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={checkAnswers}
                  className="mt-6 bg-purple-500 hover:bg-purple-600 w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Vérifier mes réponses
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {showResults && (
            <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Résultats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪'}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    Score: {score}%
                  </div>
                  <div className="text-gray-600 mb-4">
                    {score >= 80 ? 'Excellent travail !' : score >= 60 ? 'Bon travail !' : 'Continue à t\'entraîner !'}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => {
                        setShowQuestions(false)
                        setUserAnswers([])
                        setShowResults(false)
                      }}
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Recommencer
                    </Button>
                    
                    <Button 
                      onClick={nextStory}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Book className="h-4 w-4 mr-2" />
                      Histoire suivante
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div className="text-center text-white">
            <div className="text-lg">
              Histoire {currentStory + 1} sur {stories.length}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <Button onClick={onBack} variant="outline" className="absolute top-8 left-8 bg-white/20 text-white border-white/30">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">📚 Lecture</h1>
          <p className="text-xl text-white/90 drop-shadow">Découvre des histoires passionnantes !</p>
        </div>

        {/* Level Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => startReading('beginner')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Débutant</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>• Histoires courtes</div>
                <div>• Vocabulaire simple</div>
                <div>• Questions faciles</div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => startReading('intermediate')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Intermédiaire</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>• Histoires moyennes</div>
                <div>• Vocabulaire enrichi</div>
                <div>• Questions détaillées</div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => startReading('advanced')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Avancé</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>• Histoires longues</div>
                <div>• Vocabulaire complexe</div>
                <div>• Questions approfondies</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mt-8 bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Star className="h-6 w-6 text-yellow-500" />
              Mes Progrès en Lecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progress?.reading?.beginner || 0}
                </div>
                <div className="text-sm text-gray-600">Débutant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progress?.reading?.intermediate || 0}
                </div>
                <div className="text-sm text-gray-600">Intermédiaire</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {progress?.reading?.advanced || 0}
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