"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Minus, ImagePlusIcon as MultiplyIcon, Star, Trophy, Lightbulb, RotateCcw, Volume2 } from "lucide-react"
import * as tf from '@tensorflow/tfjs';
import { speakText, speakNumber, stopSpeech, isSpeaking } from "@/lib/text-to-speech"

interface MathExercisesProps {
  onBack: () => void
  progress: any
  setProgress: (progress: any) => void
  lang: 'fr' | 'es' | 'en'
  setLang: (lang: 'fr' | 'es' | 'en') => void
}

const translations = {
  fr: {
    mathTitle: '🔢 Mathématiques 🔢',
    chooseType: "Choisis ton type d'exercice !",
    additions: 'Additions',
    subtractions: 'Soustractions',
    multiplications: 'Multiplications',
    divisions: 'Divisions',
    writeNumbers: 'Écrire les nombres',
    // ...and so on for all UI text...
  },
  es: {
    mathTitle: '🔢 Matemáticas 🔢',
    chooseType: '¡Elige tu tipo de ejercicio!',
    additions: 'Sumas',
    subtractions: 'Restas',
    multiplications: 'Multiplicaciones',
    divisions: 'Divisiones',
    writeNumbers: 'Escribir los números',
    // ...
  },
  en: {
    mathTitle: '🔢 Math 🔢',
    chooseType: 'Choose your exercise type!',
    additions: 'Additions',
    subtractions: 'Subtractions',
    multiplications: 'Multiplications',
    divisions: 'Divisions',
    writeNumbers: 'Write the numbers',
    // ...
  },
}

export default function MathExercises({ onBack, progress, setProgress, lang, setLang }: MathExercisesProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [mnistModel, setMnistModel] = useState<tf.LayersModel | null>(null);
  const [exercises, setExercises] = useState<any[]>([])
  const [exercise, setExercise] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiContent, setAiContent] = useState<any>(null)
  const [selectedWordCount, setSelectedWordCount] = useState<string | null>(null)
  const [isChangingLength, setIsChangingLength] = useState(false)

  const numberCanvasRef = useRef<HTMLCanvasElement>(null)
  const whiteboardCanvasRef = useRef<HTMLCanvasElement>(null)
  const scribbleInputRef = useRef<HTMLDivElement>(null)

  // Initialize canvas with proper resolution
  useEffect(() => {
    const canvas = numberCanvasRef.current
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

  // Initialize whiteboard canvas
  useEffect(() => {
    const canvas = whiteboardCanvasRef.current
    if (!canvas) return

    const resizeWhiteboard = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
      }
    }

    resizeWhiteboard()
    window.addEventListener('resize', resizeWhiteboard)
    
    return () => {
      window.removeEventListener('resize', resizeWhiteboard)
    }
  }, [])

  // Load MNIST model on mount
  useEffect(() => {
    async function loadModel() {
      // You can use a public pre-trained MNIST model or host your own
      // Here we use a public one for demo purposes
      const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mnist/model.json');
      setMnistModel(model);
    }
    loadModel();
  }, []);

  // Preprocess canvas image for MNIST (28x28 grayscale)
  const preprocessCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    // Resize to 28x28
    const temp = document.createElement('canvas');
    temp.width = 28;
    temp.height = 28;
    const tempCtx = temp.getContext('2d');
    if (!tempCtx) return null;
    tempCtx.drawImage(canvas, 0, 0, 28, 28);
    // Get grayscale data
    const imgData = tempCtx.getImageData(0, 0, 28, 28);
    const data = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
      // Invert color: MNIST expects white digit on black
      const avg = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
      data.push((255 - avg) / 255);
    }
    return tf.tensor(data, [1, 28, 28, 1]);
  };

  // Recognize all digits on click
  const recognizeAllDigits = async () => {
    if (!mnistModel || !numberCanvasRef.current) return "";
    
    const canvas = numberCanvasRef.current;
    const tensor = preprocessCanvas(canvas);
    if (!tensor) return "";
    
    try {
      const prediction = mnistModel.predict(tensor) as tf.Tensor;
      const digit = prediction.argMax(1).dataSync()[0];
      const result = digit.toString();
      
      tensor.dispose();
      prediction.dispose();
      
      return result;
    } catch (error) {
      console.error('Recognition error:', error);
      return "";
    }
  };

  // Handle Apple Scribble input and keyboard typing
  const handleScribbleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    let text = target.textContent || "";

    // Clear placeholder text if it's still there
    if (text.includes("Écris avec ton crayon...")) {
      target.textContent = "";
      return;
    }

    // Only allow numbers
    const numbersOnly = text.replace(/[^0-9]/g, "");

    // Only update if the text actually changed (to avoid cursor jump)
    if (numbersOnly !== text) {
      target.textContent = numbersOnly;
      // Move cursor to the end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(target);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    setUserAnswer(numbersOnly);
  }

  const clearScribbleInput = () => {
    if (scribbleInputRef.current) {
      scribbleInputRef.current.textContent = ""
      setUserAnswer("")
    }
  }

  // Enhanced audio function with local accents
  const playAudio = (text: string, lang: string = 'fr') => {
    // Stop any current speech first
    stopSpeech()
    
    // Use the new TTS utility for better pronunciation
    speakText(text, lang, { rate: 0.8 }).then(() => {
    }).catch(error => {
      console.error('Speech synthesis error:', error)
      // Fallback to basic speech synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        const langCodes = { fr: "fr-FR", es: "es-ES", en: "en-US" }
        utterance.lang = langCodes[lang as keyof typeof langCodes] || "fr-FR"
        utterance.rate = 0.8
        utterance.onend = () => {}
        utterance.onerror = () => {}
        speechSynthesis.speak(utterance)
      }
    })
  }

  // Play number with proper pronunciation
  const playNumberAudio = (number: number, lang: string = 'fr') => {
    stopSpeech()
    
    speakNumber(number, lang).then(() => {
    }).catch(error => {
      console.error('Number speech error:', error)
    })
  }

  // Number to word conversion for different languages
  const numberToWord: { [key: string]: { [key: number]: string } } = {
    fr: {
      0: "zéro", 1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq", 6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix",
      11: "onze", 12: "douze", 13: "treize", 14: "quatorze", 15: "quinze", 16: "seize", 17: "dix-sept", 18: "dix-huit", 19: "dix-neuf", 20: "vingt",
      21: "vingt-et-un", 22: "vingt-deux", 23: "vingt-trois", 24: "vingt-quatre", 25: "vingt-cinq", 26: "vingt-six", 27: "vingt-sept", 28: "vingt-huit", 29: "vingt-neuf", 30: "trente",
      31: "trente-et-un", 32: "trente-deux", 33: "trente-trois", 34: "trente-quatre", 35: "trente-cinq", 36: "trente-six", 37: "trente-sept", 38: "trente-huit", 39: "trente-neuf", 40: "quarante",
      41: "quarante-et-un", 42: "quarante-deux", 43: "quarante-trois", 44: "quarante-quatre", 45: "quarante-cinq", 46: "quarante-six", 47: "quarante-sept", 48: "quarante-huit", 49: "quarante-neuf", 50: "cinquante",
      51: "cinquante-et-un", 52: "cinquante-deux", 53: "cinquante-trois", 54: "cinquante-quatre", 55: "cinquante-cinq", 56: "cinquante-six", 57: "cinquante-sept", 58: "cinquante-huit", 59: "cinquante-neuf", 60: "soixante",
      61: "soixante-et-un", 62: "soixante-deux", 63: "soixante-trois", 64: "soixante-quatre", 65: "soixante-cinq", 66: "soixante-six", 67: "soixante-sept", 68: "soixante-huit", 69: "soixante-neuf", 70: "soixante-dix",
      71: "soixante-et-onze", 72: "soixante-douze", 73: "soixante-treize", 74: "soixante-quatorze", 75: "soixante-quinze", 76: "soixante-seize", 77: "soixante-dix-sept", 78: "soixante-dix-huit", 79: "soixante-dix-neuf", 80: "quatre-vingts",
      81: "quatre-vingt-un", 82: "quatre-vingt-deux", 83: "quatre-vingt-trois", 84: "quatre-vingt-quatre", 85: "quatre-vingt-cinq", 86: "quatre-vingt-six", 87: "quatre-vingt-sept", 88: "quatre-vingt-huit", 89: "quatre-vingt-neuf", 90: "quatre-vingt-dix",
      91: "quatre-vingt-onze", 92: "quatre-vingt-douze", 93: "quatre-vingt-treize", 94: "quatre-vingt-quatorze", 95: "quatre-vingt-quinze", 96: "quatre-vingt-seize", 97: "quatre-vingt-dix-sept", 98: "quatre-vingt-dix-huit", 99: "quatre-vingt-dix-neuf", 100: "cent"
    },
    es: {
      0: "cero", 1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
      11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince", 16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve", 20: "veinte",
      21: "veintiuno", 22: "veintidós", 23: "veintitrés", 24: "veinticuatro", 25: "veinticinco", 26: "veintiséis", 27: "veintisiete", 28: "veintiocho", 29: "veintinueve", 30: "treinta",
      31: "treinta y uno", 32: "treinta y dos", 33: "treinta y tres", 34: "treinta y cuatro", 35: "treinta y cinco", 36: "treinta y seis", 37: "treinta y siete", 38: "treinta y ocho", 39: "treinta y nueve", 40: "cuarenta",
      41: "cuarenta y uno", 42: "cuarenta y dos", 43: "cuarenta y tres", 44: "cuarenta y cuatro", 45: "cuarenta y cinco", 46: "cuarenta y seis", 47: "cuarenta y siete", 48: "cuarenta y ocho", 49: "cuarenta y nueve", 50: "cincuenta",
      51: "cincuenta y uno", 52: "cincuenta y dos", 53: "cincuenta y tres", 54: "cincuenta y cuatro", 55: "cincuenta y cinco", 56: "cincuenta y seis", 57: "cincuenta y siete", 58: "cincuenta y ocho", 59: "cincuenta y nueve", 60: "sesenta",
      61: "sesenta y uno", 62: "sesenta y dos", 63: "sesenta y tres", 64: "sesenta y cuatro", 65: "sesenta y cinco", 66: "sesenta y seis", 67: "sesenta y siete", 68: "sesenta y ocho", 69: "sesenta y nueve", 70: "setenta",
      71: "setenta y uno", 72: "setenta y dos", 73: "setenta y tres", 74: "setenta y cuatro", 75: "setenta y cinco", 76: "setenta y seis", 77: "setenta y siete", 78: "setenta y ocho", 79: "setenta y nueve", 80: "ochenta",
      81: "ochenta y uno", 82: "ochenta y dos", 83: "ochenta y tres", 84: "ochenta y cuatro", 85: "ochenta y cinco", 86: "ochenta y seis", 87: "ochenta y siete", 88: "ochenta y ocho", 89: "ochenta y nueve", 90: "noventa",
      91: "noventa y uno", 92: "noventa y dos", 93: "noventa y tres", 94: "noventa y cuatro", 95: "noventa y cinco", 96: "noventa y seis", 97: "noventa y siete", 98: "noventa y ocho", 99: "noventa y nueve", 100: "cien"
    },
    en: {
      0: "zero", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
      11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty",
      21: "twenty-one", 22: "twenty-two", 23: "twenty-three", 24: "twenty-four", 25: "twenty-five", 26: "twenty-six", 27: "twenty-seven", 28: "twenty-eight", 29: "twenty-nine", 30: "thirty",
      31: "thirty-one", 32: "thirty-two", 33: "thirty-three", 34: "thirty-four", 35: "thirty-five", 36: "thirty-six", 37: "thirty-seven", 38: "thirty-eight", 39: "thirty-nine", 40: "forty",
      41: "forty-one", 42: "forty-two", 43: "forty-three", 44: "forty-four", 45: "forty-five", 46: "forty-six", 47: "forty-seven", 48: "forty-eight", 49: "forty-nine", 50: "fifty",
      51: "fifty-one", 52: "fifty-two", 53: "fifty-three", 54: "fifty-four", 55: "fifty-five", 56: "fifty-six", 57: "fifty-seven", 58: "fifty-eight", 59: "fifty-nine", 60: "sixty",
      61: "sixty-one", 62: "sixty-two", 63: "sixty-three", 64: "sixty-four", 65: "sixty-five", 66: "sixty-six", 67: "sixty-seven", 68: "sixty-eight", 69: "sixty-nine", 70: "seventy",
      71: "seventy-one", 72: "seventy-two", 73: "seventy-three", 74: "seventy-four", 75: "seventy-five", 76: "seventy-six", 77: "seventy-seven", 78: "seventy-eight", 79: "seventy-nine", 80: "eighty",
      81: "eighty-one", 82: "eighty-two", 83: "eighty-three", 84: "eighty-four", 85: "eighty-five", 86: "eighty-six", 87: "eighty-seven", 88: "eighty-eight", 89: "eighty-nine", 90: "ninety",
      91: "ninety-one", 92: "ninety-two", 93: "ninety-three", 94: "ninety-four", 95: "ninety-five", 96: "ninety-six", 97: "ninety-seven", 98: "ninety-eight", 99: "ninety-nine", 100: "one hundred"
    }
  }

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

  const generateWriteNumber = () => {
    // Generate a random number between 0 and 100
    const number = Math.floor(Math.random() * 101)
    const lang = 'fr' // Default to French, can be made dynamic later
    const wordForm = numberToWord[lang][number]
    
    return {
      question: `Écris le nombre : ${wordForm}`,
      answer: number.toString(),
      type: "writeNumber",
      wordForm: wordForm,
      number: number,
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
      case "writeNumber":
        return generateWriteNumber()
      default:
        return generateAddition()
    }
  }

  useEffect(() => {
    if (selectedType) {
      setExercise(generateExercise(selectedType))
    }
  }, [selectedType, currentExercise])

  // Update checkAnswer to use the visible text input for writeNumber
  const checkAnswer = async () => {
    if (!exercise) return;
    let answerToCheck = userAnswer.trim();
    
    // For writeNumber, always use the visible text input (from contenteditable)
    // Compare as string to the correct answer
    if (selectedType === 'writeNumber') {
      answerToCheck = userAnswer.trim();
    }
    
    const correct = answerToCheck === exercise.answer.toString();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + 1);
      setProgress((prev: any) => ({
        ...prev,
        math: {
          ...prev.math,
          [selectedType!]: (prev.math[selectedType!] || 0) + 1,
        },
      }));

      // For multiplication, reveal part of the image
      if (selectedType === "multiplication") {
        setRevealedParts((prev) => [...prev, currentExercise]);
        setImageProgress((prev) => prev + 1);
      }
    }
  };

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

  // Whiteboard drawing functions
  const startWhiteboardDrawing = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    const canvas = whiteboardCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the scale factor between canvas size and display size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let x: number, y: number

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0]
      x = (touch.clientX - rect.left) * scaleX
      y = (touch.clientY - rect.top) * scaleY
    } else {
      // Pointer event
      x = (e.clientX - rect.left) * scaleX
      y = (e.clientY - rect.top) * scaleY
    }

    // Set up drawing context
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const drawOnWhiteboard = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = whiteboardCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the scale factor between canvas size and display size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let x: number, y: number

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0]
      x = (touch.clientX - rect.left) * scaleX
      y = (touch.clientY - rect.top) * scaleY
    } else {
      // Pointer event
      x = (e.clientX - rect.left) * scaleX
      y = (e.clientY - rect.top) * scaleY
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopWhiteboardDrawing = () => {
    setIsDrawing(false)
  }

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, rect.width * dpr, rect.height * dpr)
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
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{translations[lang].mathTitle}</h1>
            <p className="text-xl text-white/90 drop-shadow">{translations[lang].chooseType}</p>
          </div>

          {/* Math Exercise Selection Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("addition")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">{translations[lang].additions}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-gray-600">
                  <div>• Nombres à 3 chiffres</div>
                  <div>• Calcul mental</div>
                  <div>• 10 exercices</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("subtraction")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <Minus className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">{translations[lang].subtractions}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-gray-600">
                  <div>• Nombres à 3 chiffres</div>
                  <div>• Avec ou sans retenue</div>
                  <div>• 10 exercices</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("multiplication")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <MultiplyIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">{translations[lang].multiplications}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-gray-600">
                  <div>• Tables jusqu'à 12</div>
                  <div>• Image mystère</div>
                  <div>• 10 exercices</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("division")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-white font-bold">÷</span>
                </div>
                <CardTitle className="text-2xl text-gray-800">{translations[lang].divisions}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-gray-600">
                  <div>• Divisions exactes</div>
                  <div>• Quotients simples</div>
                  <div>• 10 exercices</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setSelectedType("writeNumber")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-white font-bold">🔢</span>
                </div>
                <CardTitle className="text-2xl text-gray-800">{translations[lang].writeNumbers}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-gray-600">
                  <div>• Nombres en lettres</div>
                  <div>• Audio à écouter</div>
                  <div>• 10 exercices</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Math Progress Overview (move to bottom) */}
          <Card className="mt-8 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-black">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Mes progrès en mathématiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row justify-center items-end w-full gap-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{progress.math.addition}</div>
                  <div className="text-base text-gray-800 mt-1">Débutant</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{progress.math.subtraction}</div>
                  <div className="text-base text-gray-800 mt-1">Intermédiaire</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{progress.math.multiplication}</div>
                  <div className="text-base text-gray-800 mt-1">Avancé</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{progress.math.division}</div>
                  <div className="text-base text-gray-800 mt-1">Divisions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{progress.math.writeNumber}</div>
                  <div className="text-base text-gray-800 mt-1">Écrire</div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                {selectedType === "writeNumber" && <span className="text-2xl text-indigo-500">🔢</span>}
                {selectedType === "addition" && translations[lang].additions}
                {selectedType === "subtraction" && translations[lang].subtractions}
                {selectedType === "multiplication" && translations[lang].multiplications}
                {selectedType === "division" && translations[lang].divisions}
                {selectedType === "writeNumber" && translations[lang].writeNumbers}
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
                ) : selectedType === "writeNumber" ? (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-indigo-700">{exercise.wordForm}</span>
                      <button
                        aria-label="Écouter le nombre"
                        className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition"
                        onClick={() => playAudio(exercise.wordForm, 'fr')}
                      >
                        <Volume2 className="w-5 h-5 text-indigo-700" />
                      </button>
                    </div>
                    
                    {/* Single large handwriting canvas */}
                    <div className="relative w-[220px] h-[100px]">
                      <canvas
                        ref={numberCanvasRef}
                        width={220}
                        height={100}
                        className="border-2 border-dashed border-indigo-300 rounded bg-white absolute top-0 left-0 w-full h-full z-0"
                        onPointerDown={(e) => {
                          setIsWriting(true);
                          const canvas = numberCanvasRef.current;
                          if (!canvas) return;
                          const rect = canvas.getBoundingClientRect();
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          ctx.beginPath();
                          ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                        }}
                        onPointerMove={(e) => {
                          if (!isWriting) return;
                          const canvas = numberCanvasRef.current;
                          if (!canvas) return;
                          const rect = canvas.getBoundingClientRect();
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                          ctx.stroke();
                        }}
                        onPointerUp={() => setIsWriting(false)}
                        onPointerLeave={() => setIsWriting(false)}
                        style={{ touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
                      />
                      <div
                        ref={scribbleInputRef}
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        className="absolute top-0 left-0 w-full h-full z-10 text-3xl text-center flex items-center justify-center bg-transparent outline-none select-text"
                        style={{ 
                          pointerEvents: 'auto',
                          cursor: 'text'
                        }}
                        onInput={handleScribbleInput}
                        onKeyDown={(e) => {
                          // Allow only numbers and navigation keys
                          if (!/[\d\b\t\ArrowLeft\ArrowRight\ArrowUp\ArrowDown\Delete]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                            e.preventDefault();
                          }
                        }}
                        onFocus={e => {
                          if (e.currentTarget.textContent === "") {
                            e.currentTarget.textContent = "";
                          }
                        }}
                        onBlur={e => {
                          // Ensure the content is properly set when focus is lost
                          const text = e.currentTarget.textContent || "";
                          const numbersOnly = text.replace(/[^0-9]/g, "");
                          setUserAnswer(numbersOnly);
                        }}
                        aria-label="Zone de saisie manuscrite ou clavier"
                      >
                        {userAnswer}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => {
                        // Clear both canvas and text
                        const canvas = numberCanvasRef.current;
                        if (canvas) {
                          const ctx = canvas.getContext("2d");
                          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                        clearScribbleInput();
                      }} className="bg-gray-400 hover:bg-gray-600 text-white">Effacer</Button>
                      
                      <Button 
                        size="sm" 
                        onClick={async () => {
                          if (userAnswer) return; // If text input exists, use it
                          const recognized = await recognizeAllDigits();
                          if (recognized) {
                            setUserAnswer(recognized);
                          }
                        }}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        disabled={!mnistModel}
                      >
                        Reconnaître
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-lg mb-4">
                    <p className="text-4xl font-bold text-gray-800">{exercise.question} = ?</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedType !== "writeNumber" && (
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Ta réponse..."
                  className="text-2xl p-4 text-center"
                  disabled={showResult}
                />
                )}

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
                    onClick={async () => await checkAnswer()}
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

          {/* Whiteboard Section - Large, simple writing space like writing correction */}
          <div className="bg-gray-50 p-6 rounded-lg mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">Dessine tes calculs ici avec ton stylet</h3>
              <Button
                onClick={clearWhiteboard}
                size="sm"
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Effacer
              </Button>
            </div>
            <canvas
              ref={whiteboardCanvasRef}
              width={800}
              height={600}
              className="w-full border-2 border-dashed border-gray-300 rounded cursor-crosshair touch-none bg-white mb-4"
              onPointerDown={startWhiteboardDrawing}
              onPointerMove={drawOnWhiteboard}
              onPointerUp={stopWhiteboardDrawing}
              onPointerLeave={stopWhiteboardDrawing}
              onTouchStart={startWhiteboardDrawing}
              onTouchMove={drawOnWhiteboard}
              onTouchEnd={stopWhiteboardDrawing}
              style={{ 
                touchAction: "none",
                WebkitUserSelect: "none",
                userSelect: "none"
              }}
            />
          </div>

          <div className="space-y-4">
          </div>
        </div>
      </div>
    </div>
  )
}
