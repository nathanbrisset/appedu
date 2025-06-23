"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Volume2, Mic, Check, X, Star } from "lucide-react"

interface LanguageExercisesProps {
  onBack: () => void
  progress: any
  setProgress: (progress: any) => void
}

const languages = {
  catalan: { name: "Català", flag: "🇪🇸", color: "red" },
  french: { name: "Français", flag: "🇫🇷", color: "blue" },
  spanish: { name: "Castellano", flag: "🇪🇸", color: "yellow" },
  english: { name: "English", flag: "🇬🇧", color: "green" },
}

const exercises = {
  catalan: {
    listening: [
      { text: "El gat dorm al sofà", question: "On dorm el gat?", answer: "al sofà" },
      { text: "La nina juga al parc", question: "Què fa la nina?", answer: "juga" },
      { text: "El sol brilla al cel", question: "Què fa el sol?", answer: "brilla" },
    ],
    words: ["casa", "escola", "amic", "família", "menjar"],
  },
  french: {
    listening: [
      { text: "Le chat dort sur le canapé", question: "Où dort le chat?", answer: "sur le canapé" },
      { text: "La fille joue dans le parc", question: "Que fait la fille?", answer: "joue" },
      { text: "Le soleil brille dans le ciel", question: "Que fait le soleil?", answer: "brille" },
    ],
    words: ["maison", "école", "ami", "famille", "manger"],
  },
  spanish: {
    listening: [
      { text: "El gato duerme en el sofá", question: "¿Dónde duerme el gato?", answer: "en el sofá" },
      { text: "La niña juega en el parque", question: "¿Qué hace la niña?", answer: "juega" },
      { text: "El sol brilla en el cielo", question: "¿Qué hace el sol?", answer: "brilla" },
    ],
    words: ["casa", "escuela", "amigo", "familia", "comer"],
  },
  english: {
    listening: [
      { text: "The cat sleeps on the sofa", question: "Where does the cat sleep?", answer: "on the sofa" },
      { text: "The girl plays in the park", question: "What does the girl do?", answer: "plays" },
      { text: "The sun shines in the sky", question: "What does the sun do?", answer: "shines" },
    ],
    words: ["house", "school", "friend", "family", "eat"],
  },
}

export default function LanguageExercises({ onBack, progress, setProgress }: LanguageExercisesProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [exerciseType, setExerciseType] = useState<string | null>(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Text-to-Speech function
  const speakText = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      const langCodes = {
        catalan: "ca-ES",
        french: "fr-FR",
        spanish: "es-ES",
        english: "en-US",
      }
      utterance.lang = langCodes[lang as keyof typeof langCodes]
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // Canvas drawing for writing exercises
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 3
    ctx.lineCap = "round"

    let x, y
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let x, y
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const checkAnswer = () => {
    if (!selectedLanguage) return

    const exercise = exercises[selectedLanguage as keyof typeof exercises].listening[currentExercise]
    const correct = userAnswer.toLowerCase().trim() === exercise.answer.toLowerCase().trim()

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
      setProgress((prev: any) => ({
        ...prev,
        languages: {
          ...prev.languages,
          [selectedLanguage]: prev.languages[selectedLanguage] + 1,
        },
      }))
    }
  }

  const nextExercise = () => {
    if (!selectedLanguage) return

    const maxExercises = exercises[selectedLanguage as keyof typeof exercises].listening.length
    if (currentExercise < maxExercises - 1) {
      setCurrentExercise(currentExercise + 1)
      setUserAnswer("")
      setShowResult(false)
      clearCanvas()
    } else {
      // Exercise completed
      alert(`Bravo ! Tu as terminé avec ${score + (isCorrect ? 1 : 0)}/${maxExercises} bonnes réponses !`)
      setSelectedLanguage(null)
      setExerciseType(null)
      setCurrentExercise(0)
      setScore(0)
    }
  }

  if (!selectedLanguage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">📚 Langues & Lecture 📚</h1>
            <p className="text-xl text-white/90 drop-shadow">Choisis ta langue préférée !</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(languages).map(([key, lang]) => (
              <Card
                key={key}
                className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedLanguage(key)}
              >
                <CardHeader className="text-center">
                  <div
                    className={`mx-auto w-16 h-16 bg-${lang.color}-500 rounded-full flex items-center justify-center mb-4`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                  </div>
                  <CardTitle className="text-2xl text-gray-800">{lang.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex justify-center items-center gap-2 text-sm text-gray-600 mb-4">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{progress.languages[key]} exercices réussis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Volume2 className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-xs">Écoute</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Mic className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-xs">Écriture</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!exerciseType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              onClick={() => setSelectedLanguage(null)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {languages[selectedLanguage as keyof typeof languages].flag}{" "}
              {languages[selectedLanguage as keyof typeof languages].name}
            </h1>
            <p className="text-xl text-white/90 drop-shadow">Choisis ton exercice !</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setExerciseType("listening")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Volume2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Écoute et Réponds</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Écoute les phrases et réponds aux questions</p>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="text-sm font-medium">
                    {exercises[selectedLanguage as keyof typeof exercises].listening.length} exercices
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setExerciseType("writing")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Écriture au Stylet</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Écris les mots avec ton stylet Apple</p>
                <div className="bg-green-100 p-3 rounded-lg">
                  <span className="text-sm font-medium">
                    {exercises[selectedLanguage as keyof typeof exercises].words.length} mots à écrire
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (exerciseType === "listening") {
    const exercise = exercises[selectedLanguage as keyof typeof exercises].listening[currentExercise]

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => setExerciseType(null)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="text-white font-bold">
              {currentExercise + 1} / {exercises[selectedLanguage as keyof typeof exercises].listening.length}
            </div>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
                <Volume2 className="h-6 w-6" />
                Écoute et Réponds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Button
                  onClick={() => speakText(exercise.text, selectedLanguage!)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4"
                >
                  <Volume2 className="h-6 w-6 mr-2" />
                  Écouter la phrase
                </Button>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-lg font-medium text-center text-gray-800">{exercise.question}</p>
              </div>

              <div className="space-y-4">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Écris ta réponse ici..."
                  className="text-lg p-4"
                  disabled={showResult}
                />

                {!showResult ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-3"
                  >
                    Vérifier ma réponse
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg text-center ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="h-6 w-6" />
                          <span className="text-lg font-bold">Bravo ! C'est correct !</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <X className="h-6 w-6" />
                            <span className="text-lg font-bold">Pas tout à fait...</span>
                          </div>
                          <p>
                            La bonne réponse était : <strong>{exercise.answer}</strong>
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={nextExercise}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white text-lg py-3"
                    >
                      {currentExercise < exercises[selectedLanguage as keyof typeof exercises].listening.length - 1
                        ? "Exercice suivant"
                        : "Terminer"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                Score : {score} / {currentExercise + (showResult && isCorrect ? 1 : 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (exerciseType === "writing") {
    const currentWord =
      exercises[selectedLanguage as keyof typeof exercises].words[
        currentExercise % exercises[selectedLanguage as keyof typeof exercises].words.length
      ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => setExerciseType(null)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="text-white font-bold">
              Mot {(currentExercise % exercises[selectedLanguage as keyof typeof exercises].words.length) + 1} /{" "}
              {exercises[selectedLanguage as keyof typeof exercises].words.length}
            </div>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
                <Mic className="h-6 w-6" />
                Écriture au Stylet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-lg mb-4">
                  <p className="text-2xl font-bold text-blue-800">{currentWord}</p>
                </div>
                <Button
                  onClick={() => speakText(currentWord, selectedLanguage!)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Écouter le mot
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-center text-gray-700">Écris ce mot avec ton stylet sur la zone ci-dessous :</p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full border rounded cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ touchAction: "none" }}
                  />
                </div>

                <div className="flex gap-4">
                  <Button onClick={clearCanvas} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white">
                    Effacer
                  </Button>
                  <Button
                    onClick={() => {
                      setScore(score + 1)
                      setProgress((prev: any) => ({
                        ...prev,
                        languages: {
                          ...prev.languages,
                          [selectedLanguage!]: prev.languages[selectedLanguage!] + 1,
                        },
                      }))
                      if (currentExercise < exercises[selectedLanguage as keyof typeof exercises].words.length - 1) {
                        setCurrentExercise(currentExercise + 1)
                        clearCanvas()
                      } else {
                        alert(`Bravo ! Tu as écrit tous les mots !`)
                        setSelectedLanguage(null)
                        setExerciseType(null)
                        setCurrentExercise(0)
                        setScore(0)
                      }
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Valider
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
