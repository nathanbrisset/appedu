"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Minus, ImagePlusIcon as MultiplyIcon, Star, Trophy, Lightbulb } from "lucide-react"

interface MathExercisesProps {
  onBack: () => void
  progress: any
  setProgress: (progress: any) => void
}

export default function MathExercises({ onBack, progress, setProgress }: MathExercisesProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [exercise, setExercise] = useState<any>(null)
  const [showHint, setShowHint] = useState(false)
  const [revealedParts, setRevealedParts] = useState<number[]>([])
  const [imageProgress, setImageProgress] = useState(0)

  // Generate random exercises
  const generateAddition = () => {
    // Niveau plus difficile : nombres jusqu'à 999
    const a = Math.floor(Math.random() * 900) + 100 // 100-999
    const b = Math.floor(Math.random() * 900) + 100 // 100-999
    return {
      question: `${a} + ${b}`,
      answer: a + b,
      type: "addition",
      operands: [a, b],
    }
  }

  const generateSubtraction = () => {
    // Niveau plus difficile : nombres jusqu'à 999
    const a = Math.floor(Math.random() * 800) + 200 // 200-999
    const b = Math.floor(Math.random() * (a - 50)) + 50 // Au moins 50 de différence
    return {
      question: `${a} - ${b}`,
      answer: a - b,
      type: "subtraction",
      operands: [a, b],
      needsBorrowing: a
        .toString()
        .split("")
        .some((digit, index) => {
          const bDigit = b.toString().split("").reverse()[index]
          return bDigit && Number.parseInt(digit) < Number.parseInt(bDigit)
        }),
    }
  }

  const generateMultiplication = () => {
    // Tables jusqu'à 12 et multiplications à 2 chiffres
    const a = Math.floor(Math.random() * 12) + 1
    const b = Math.floor(Math.random() * 12) + 1
    return {
      question: `${a} × ${b}`,
      answer: a * b,
      type: "multiplication",
      operands: [a, b],
    }
  }

  const generateDivision = () => {
    // Divisions simples avec reste 0
    const b = Math.floor(Math.random() * 10) + 2 // Diviseur de 2 à 11
    const quotient = Math.floor(Math.random() * 10) + 1 // Quotient de 1 à 10
    const a = b * quotient // Pour avoir une division exacte
    return {
      question: `${a} ÷ ${b}`,
      answer: quotient,
      type: "division",
      operands: [a, b],
    }
  }

  const generateExercise = (type: string) => {
    switch (type) {
      case "addition":
        return generateAddition()
      case "subtraction":
        return generateSubtraction()
      case "multiplication":
        return generateMultiplication()
      case "division":
        return generateDivision()
      default:
        return generateAddition()
    }
  }

  useEffect(() => {
    if (selectedType) {
      setExercise(generateExercise(selectedType))
    }
  }, [selectedType, currentExercise])

  const checkAnswer = () => {
    if (!exercise) return

    const correct = Number.parseInt(userAnswer) === exercise.answer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
      setProgress((prev: any) => ({
        ...prev,
        math: {
          ...prev.math,
          [selectedType!]: prev.math[selectedType!] + 1,
        },
      }))

      // For multiplication, reveal part of the image
      if (selectedType === "multiplication") {
        setRevealedParts((prev) => [...prev, currentExercise])
        setImageProgress((prev) => prev + 1)
      }
    }
  }

  const nextExercise = () => {
    if (currentExercise < 9) {
      // 10 exercises per session
      setCurrentExercise(currentExercise + 1)
      setUserAnswer("")
      setShowResult(false)
      setShowHint(false)
    } else {
      // Exercise completed
      if (selectedType === "multiplication") {
        alert(`Bravo ! Tu as révélé l'image mystère ! Score: ${score + (isCorrect ? 1 : 0)}/10`)
      } else {
        alert(`Excellent travail ! Score: ${score + (isCorrect ? 1 : 0)}/10`)
      }
      setSelectedType(null)
      setCurrentExercise(0)
      setScore(0)
      setRevealedParts([])
      setImageProgress(0)
    }
  }

  const renderSubtractionHint = () => {
    if (!exercise || exercise.type !== "subtraction" || !showHint) return null

    const [a, b] = exercise.operands
    const aStr = a.toString()
    const bStr = b.toString()

    return (
      <div className="bg-yellow-100 p-4 rounded-lg mt-4">
        <h4 className="font-bold text-yellow-800 mb-2">💡 Aide pour la soustraction :</h4>
        <div className="space-y-2">
          <p className="text-sm">Regarde bien ton calcul posé :</p>
          <div className="font-mono text-2xl bg-white p-4 rounded border-2 border-dashed inline-block">
            <div className="text-right min-w-[100px] space-y-1">
              <div className="text-gray-600">{exercise.operands[0]}</div>
              <div className="border-b border-gray-400 pb-1">- {exercise.operands[1]}</div>
              <div className="text-blue-600">___</div>
            </div>
          </div>
          {exercise.needsBorrowing && (
            <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">⚠️ Attention ! Regarde chaque colonne :</p>
              <p className="text-xs text-orange-600 mt-1">
                Si le chiffre du haut est plus petit que celui du bas, tu dois "emprunter" 10 à la colonne de gauche !
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMultiplicationImage = () => {
    if (selectedType !== "multiplication") return null

    const totalParts = 10
    const revealedCount = revealedParts.length

    return (
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg">
        <h4 className="font-bold text-purple-800 mb-2">🖼️ Image Mystère</h4>
        <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto">
          {Array.from({ length: totalParts }, (_, i) => (
            <div
              key={i}
              className={`aspect-square rounded ${
                revealedParts.includes(i) ? "bg-gradient-to-br from-blue-400 to-purple-500" : "bg-gray-300"
              } flex items-center justify-center text-white font-bold`}
            >
              {revealedParts.includes(i) ? "🌟" : "?"}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-purple-700 mt-2">{revealedCount}/10 parties révélées</p>
        {revealedCount === 10 && (
          <div className="text-center mt-4">
            <p className="text-2xl">🎉 C'est un château magique ! 🏰</p>
          </div>
        )}
      </div>
    )
  }

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">🔢 Mathématiques 🔢</h1>
            <p className="text-xl text-white/90 drop-shadow">Choisis ton type d'exercice !</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("addition")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Additions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-green-100 p-3 rounded-lg mb-4">
                  <p className="text-lg font-bold text-green-800">12 + 8 = ?</p>
                </div>
                <div className="flex justify-center items-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{progress.math.addition} réussies</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("subtraction")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Minus className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Soustractions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-orange-100 p-3 rounded-lg mb-4">
                  <p className="text-lg font-bold text-orange-800">25 - 17 = ?</p>
                </div>
                <div className="flex justify-center items-center gap-2 text-sm text-gray-600 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{progress.math.subtraction} réussies</span>
                </div>
                <p className="text-xs text-gray-500">Avec aide pour poser le calcul</p>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("multiplication")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                  <MultiplyIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Tables ×</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-purple-100 p-3 rounded-lg mb-4">
                  <p className="text-lg font-bold text-purple-800">7 × 6 = ?</p>
                </div>
                <div className="flex justify-center items-center gap-2 text-sm text-gray-600 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{progress.math.multiplication} réussies</span>
                </div>
                <p className="text-xs text-gray-500">Révèle l'image mystère !</p>
              </CardContent>
            </Card>
            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("division")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-white font-bold">÷</span>
                </div>
                <CardTitle className="text-2xl text-gray-800">Divisions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-red-100 p-3 rounded-lg mb-4">
                  <p className="text-lg font-bold text-red-800">56 ÷ 7 = ?</p>
                </div>
                <div className="flex justify-center items-center gap-2 text-sm text-gray-600 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{progress.math.division || 0} réussies</span>
                </div>
                <p className="text-xs text-gray-500">Divisions exactes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!exercise) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setSelectedType(null)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="text-white font-bold">{currentExercise + 1} / 10</div>
        </div>

        <div className="grid gap-6">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
                {selectedType === "addition" && <Plus className="h-6 w-6 text-green-500" />}
                {selectedType === "subtraction" && <Minus className="h-6 w-6 text-orange-500" />}
                {selectedType === "multiplication" && <MultiplyIcon className="h-6 w-6 text-purple-500" />}
                {selectedType === "division" && <span className="text-2xl text-red-500 font-bold">÷</span>}
                {selectedType === "addition" && "Addition"}
                {selectedType === "subtraction" && "Soustraction"}
                {selectedType === "multiplication" && "Multiplication"}
                {selectedType === "division" && "Division"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {selectedType === "addition" || selectedType === "subtraction" ? (
                  <div className="bg-gray-100 p-6 rounded-lg mb-4 inline-block">
                    <div className="font-mono text-3xl font-bold text-gray-800 space-y-2">
                      <div className="text-right min-w-[120px]">{exercise.operands[0].toString().padStart(3, " ")}</div>
                      <div className="text-right border-b-2 border-gray-600 pb-1">
                        {selectedType === "addition" ? "+" : "-"} {exercise.operands[1].toString().padStart(2, " ")}
                      </div>
                      <div className="text-right text-blue-600">
                        {showResult ? exercise.answer.toString().padStart(3, " ") : "___"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-lg mb-4">
                    <p className="text-4xl font-bold text-gray-800">{exercise.question} = ?</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Ta réponse..."
                  className="text-2xl p-4 text-center"
                  disabled={showResult}
                />

                {selectedType === "subtraction" && (
                  <Button
                    onClick={() => setShowHint(!showHint)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    disabled={showResult}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHint ? "Cacher l'aide" : "Montrer l'aide"}
                  </Button>
                )}

                {renderSubtractionHint()}

                {!showResult ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg py-3"
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
                          <Trophy className="h-6 w-6" />
                          <span className="text-lg font-bold">Excellent ! C'est correct !</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
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
                      {currentExercise < 9 ? "Exercice suivant" : "Terminer"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                Score : {score} / {currentExercise + (showResult && isCorrect ? 1 : 0)}
              </div>
            </CardContent>
          </Card>

          {renderMultiplicationImage()}
        </div>
      </div>
    </div>
  )
}
