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
  lang: 'fr' | 'es' | 'en'
  setLang: (lang: 'fr' | 'es' | 'en') => void
}

const translations = {
  fr: {
    writing: 'Écriture',
    developCreativity: 'Développe ta créativité !',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    simpleDescriptions: 'Descriptions simples',
    shortSentences: 'Phrases courtes',
    wordGoal: 'mots',
    shortStories: 'Histoires courtes',
    logicalConnectors: 'Connecteurs logiques',
    moreWords: 'Plus de mots',
    creativeStories: 'Histoires créatives',
    dialogue: 'Dialogue',
    longTexts: 'Textes longs',
    back: 'Retour',
    writingTips: "Conseils d'écriture",
    writingTipsTitle: '💡 Conseils pour bien écrire',
    yourText: 'Ton texte',
    startWriting: 'Commence à écrire ici...',
    wordsWritten: 'mots écrits',
    evaluate: 'Évaluer mon texte',
    evaluation: 'Évaluation',
    score: 'Score',
    restart: 'Recommencer',
    nextExercise: 'Exercice suivant',
    exercise: 'Exercice',
    of: 'sur',
    level: 'Niveau',
    hints: '💡 Indices :',
    instruction: 'Consigne :',
    objective: 'Objectif',
    tips: 'Conseils',
    completed: 'Exercice complété !',
    moreIdeas: 'Développe davantage tes idées.',
    goodWordCount: 'Bon nombre de mots.',
    tryMore: 'Essaie d\'écrire un peu plus.',
    goodContent: 'Bon contenu développé.',
    connectors: 'Bon usage des connecteurs.',
    excellent: 'Excellent ! C\'est correct !',
    notQuite: 'Pas tout à fait...',
    correctAnswer: 'La bonne réponse était :',
    progress: 'Mes Progrès en Écriture',
  },
  es: {
    writing: 'Escritura',
    developCreativity: '¡Desarrolla tu creatividad!',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    simpleDescriptions: 'Descripciones simples',
    shortSentences: 'Frases cortas',
    wordGoal: 'palabras',
    shortStories: 'Historias cortas',
    logicalConnectors: 'Conectores lógicos',
    moreWords: 'Más palabras',
    creativeStories: 'Historias creativas',
    dialogue: 'Diálogo',
    longTexts: 'Textos largos',
    back: 'Volver',
    writingTips: 'Consejos de escritura',
    writingTipsTitle: '💡 Consejos para escribir bien',
    yourText: 'Tu texto',
    startWriting: 'Empieza a escribir aquí...',
    wordsWritten: 'palabras escritas',
    evaluate: 'Evaluar mi texto',
    evaluation: 'Evaluación',
    score: 'Puntuación',
    restart: 'Reiniciar',
    nextExercise: 'Siguiente ejercicio',
    exercise: 'Ejercicio',
    of: 'de',
    level: 'Nivel',
    hints: '💡 Pistas:',
    instruction: 'Consigna:',
    objective: 'Objetivo',
    tips: 'Consejos',
    completed: '¡Ejercicio completado!',
    moreIdeas: 'Desarrolla más tus ideas.',
    goodWordCount: 'Buen número de palabras.',
    tryMore: 'Intenta escribir un poco más.',
    goodContent: 'Buen contenido desarrollado.',
    connectors: 'Buen uso de conectores.',
    excellent: '¡Excelente! ¡Es correcto!',
    notQuite: 'No del todo...',
    correctAnswer: 'La respuesta correcta era:',
    progress: 'Mi Progreso en Escritura',
  },
  en: {
    writing: 'Writing',
    developCreativity: 'Develop your creativity!',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    simpleDescriptions: 'Simple descriptions',
    shortSentences: 'Short sentences',
    wordGoal: 'words',
    shortStories: 'Short stories',
    logicalConnectors: 'Logical connectors',
    moreWords: 'More words',
    creativeStories: 'Creative stories',
    dialogue: 'Dialogue',
    longTexts: 'Long texts',
    back: 'Back',
    writingTips: 'Writing tips',
    writingTipsTitle: '💡 Tips for good writing',
    yourText: 'Your text',
    startWriting: 'Start writing here...',
    wordsWritten: 'words written',
    evaluate: 'Check my writing',
    evaluation: 'Evaluation',
    score: 'Score',
    restart: 'Restart',
    nextExercise: 'Next exercise',
    exercise: 'Exercise',
    of: 'of',
    level: 'Level',
    hints: '💡 Hints:',
    instruction: 'Instruction:',
    objective: 'Goal',
    tips: 'Tips',
    completed: 'Exercise completed!',
    moreIdeas: 'Develop your ideas more.',
    goodWordCount: 'Good word count.',
    tryMore: 'Try to write a bit more.',
    goodContent: 'Good content developed.',
    connectors: 'Good use of connectors.',
    excellent: 'Excellent! That\'s correct!',
    notQuite: 'Not quite...',
    correctAnswer: 'The correct answer was:',
    progress: 'My Writing Progress',
  },
}

type WritingPrompt = {
  title: string;
  prompt: string;
  hints: string[];
  theme: string;
  emoji: string;
  wordCount: number;
};

type WritingPromptsByLevel = {
  beginner: WritingPrompt[];
  intermediate: WritingPrompt[];
  advanced: WritingPrompt[];
};

type WritingPromptsByLang = {
  fr: WritingPromptsByLevel;
  es: WritingPromptsByLevel;
  en: WritingPromptsByLevel;
};

const writingPrompts: WritingPromptsByLang = {
  fr: {
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
  },
  es: {
    beginner: [
      {
        title: "Mi Animal Favorito",
        prompt: "Describe a tu animal favorito. ¿Cómo se llama? ¿De qué color es? ¿Qué hace?",
        hints: ["Nombre del animal", "Color", "Qué hace"],
        theme: "animals",
        emoji: "🐾",
        wordCount: 30
      },
      {
        title: "Mi Familia",
        prompt: "Habla de tu familia. ¿Quiénes son los miembros de tu familia? ¿Qué hacen juntos?",
        hints: ["Nombres de los miembros", "Actividades juntos"],
        theme: "family",
        emoji: "👨‍👩‍👧‍👦",
        wordCount: 40
      },
      {
        title: "Mi Juguete Favorito",
        prompt: "Describe tu juguete favorito. ¿Cómo es? ¿Con qué juegas?",
        hints: ["Descripción del juguete", "Cómo juegas"],
        theme: "toys",
        emoji: "🧸",
        wordCount: 35
      }
    ],
    intermediate: [
      {
        title: "Una Aventura Mágica",
        prompt: "Imagina que descubres un objeto mágico. ¿Qué sucede? ¿A dónde vas? ¿Qué haces?",
        hints: ["El objeto mágico", "La aventura", "El final"],
        theme: "fantasy",
        emoji: "✨",
        wordCount: 80
      },
      {
        title: "Mi Héroe",
        prompt: "Describe a tu héroe favorito. ¿Por qué lo admiras? ¿Qué harías si lo conocieras?",
        hints: ["Quién es tu héroe", "Por qué lo admiras", "Si lo conocieras"],
        theme: "heroes",
        emoji: "🦸‍♂️",
        wordCount: 70
      },
      {
        title: "Un Viaje Extraordinario",
        prompt: "Si pudieras viajar a cualquier lugar, ¿a dónde irías? ¿Qué harías allí?",
        hints: ["El destino", "Qué harías", "Por qué ese lugar"],
        theme: "travel",
        emoji: "✈️",
        wordCount: 75
      }
    ],
    advanced: [
      {
        title: "Una Historia de Misterio",
        prompt: "Escribe una historia corta de misterio. Alguien ha desaparecido o algo ha sido robado. ¿Qué sucede?",
        hints: ["El misterio", "Los personajes", "La solución"],
        theme: "mystery",
        emoji: "🔍",
        wordCount: 120
      },
      {
        title: "El Mundo del Mañana",
        prompt: "Imagina el mundo dentro de 50 años. ¿Cómo será la vida? ¿Qué nuevas tecnologías existirán?",
        hints: ["Las tecnologías", "La vida cotidiana", "Los cambios"],
        theme: "future",
        emoji: "🚀",
        wordCount: 100
      },
      {
        title: "Una Amistad Especial",
        prompt: "Cuenta la historia de una amistad entre dos personajes muy diferentes. ¿Cómo se conocieron?",
        hints: ["Los personajes", "El encuentro", "La amistad"],
        theme: "friendship",
        emoji: "🤝",
        wordCount: 110
      }
    ]
  },
  en: {
    beginner: [
      {
        title: "My Favorite Animal",
        prompt: "Describe your favorite animal. What is its name? What color is it? What does it do?",
        hints: ["Animal's name", "Color", "What it does"],
        theme: "animals",
        emoji: "🐾",
        wordCount: 30
      },
      {
        title: "My Family",
        prompt: "Talk about your family. Who are the members of your family? What do you do together?",
        hints: ["Names of members", "Activities together"],
        theme: "family",
        emoji: "👨‍👩‍👧‍👦",
        wordCount: 40
      },
      {
        title: "My Favorite Toy",
        prompt: "Describe your favorite toy. What does it look like? What do you play with?",
        hints: ["Toy description", "How you play"],
        theme: "toys",
        emoji: "🧸",
        wordCount: 35
      }
    ],
    intermediate: [
      {
        title: "A Magical Adventure",
        prompt: "Imagine you discover a magical object. What happens? Where do you go? What do you do?",
        hints: ["The magical object", "The adventure", "The ending"],
        theme: "fantasy",
        emoji: "✨",
        wordCount: 80
      },
      {
        title: "My Hero",
        prompt: "Describe your favorite hero. Why do you admire them? What would you do if you met them?",
        hints: ["Who is your hero", "Why you admire them", "If you met them"],
        theme: "heroes",
        emoji: "🦸‍♂️",
        wordCount: 70
      },
      {
        title: "An Extraordinary Trip",
        prompt: "If you could travel anywhere, where would you go? What would you do there?",
        hints: ["The destination", "What you would do", "Why that place"],
        theme: "travel",
        emoji: "✈️",
        wordCount: 75
      }
    ],
    advanced: [
      {
        title: "A Mystery Story",
        prompt: "Write a short mystery story. Someone has disappeared or something has been stolen. What happens?",
        hints: ["The mystery", "The characters", "The solution"],
        theme: "mystery",
        emoji: "🔍",
        wordCount: 120
      },
      {
        title: "The World of Tomorrow",
        prompt: "Imagine the world in 50 years. What will life be like? What new technologies will exist?",
        hints: ["Technologies", "Daily life", "Changes"],
        theme: "future",
        emoji: "🚀",
        wordCount: 100
      },
      {
        title: "A Special Friendship",
        prompt: "Tell the story of a friendship between two very different characters. How did they meet?",
        hints: ["The characters", "The meeting", "The friendship"],
        theme: "friendship",
        emoji: "🤝",
        wordCount: 110
      }
    ]
  }
};

type WritingTipsByLevel = {
  beginner: string[];
  intermediate: string[];
  advanced: string[];
};

type WritingTipsByLang = {
  fr: WritingTipsByLevel;
  es: WritingTipsByLevel;
  en: WritingTipsByLevel;
};

const writingTips: WritingTipsByLang = {
  fr: {
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
  },
  es: {
    beginner: [
      "Usa palabras simples",
      "Haz frases cortas",
      "Describe lo que ves",
      "Usa tus sentidos (ver, oír, tocar)"
    ],
    intermediate: [
      "Agrega detalles",
      "Usa conectores (y, pero, porque)",
      "Describe las emociones",
      "Haz comparaciones"
    ],
    advanced: [
      "Estructura tu texto (inicio, medio, final)",
      "Usa un vocabulario variado",
      "Agrega diálogo",
      "Crea tensión o emoción"
    ]
  },
  en: {
    beginner: [
      "Use simple words",
      "Write short sentences",
      "Describe what you see",
      "Use your senses (see, hear, touch)"
    ],
    intermediate: [
      "Add details",
      "Use connectors (and, but, because)",
      "Describe emotions",
      "Make comparisons"
    ],
    advanced: [
      "Structure your text (beginning, middle, end)",
      "Use varied vocabulary",
      "Add dialogue",
      "Create tension or emotion"
    ]
  }
};

export default function WritingExercises({ onBack, progress, setProgress, lang, setLang }: WritingExercisesProps) {
  const [currentLevel, setCurrentLevel] = useState<string | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [userText, setUserText] = useState("")
  const [showTips, setShowTips] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [evaluation, setEvaluation] = useState({ score: 0, feedback: "" })
  const t = translations[lang];

  const startWriting = (level: string) => {
    setCurrentLevel(level)
    setCurrentPrompt(0)
    setUserText("")
    setShowTips(false)
    setShowEvaluation(false)
  }

  const evaluateWriting = () => {
    const currentPromptData = writingPrompts[lang][currentLevel as keyof WritingPromptsByLevel][currentPrompt]
    const wordCount = userText.split(/\s+/).filter(word => word.length > 0).length
    const targetWords = currentPromptData.wordCount
    
    let score = 0
    let feedback = ""

    // Word count evaluation
    if (wordCount >= targetWords * 0.8) {
      score += 30
      feedback += "✅ " + t.goodWordCount + " "
    } else {
      feedback += "⚠️ " + t.tryMore + " "
    }

    // Content evaluation (basic)
    if (userText.length > 50) {
      score += 40
      feedback += "✅ " + t.goodContent + " "
    } else {
      feedback += "⚠️ " + t.moreIdeas + " "
    }

    // Creativity bonus
    if (userText.includes("parce que") || userText.includes("mais") || userText.includes("et")) {
      score += 20
      feedback += "✅ " + t.connectors + " "
    }

    // Completion bonus
    if (userText.trim().length > 0) {
      score += 10
      feedback += "✅ " + t.completed + " "
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
    const prompts = writingPrompts[lang][currentLevel as keyof WritingPromptsByLevel]
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

  if (currentLevel && writingPrompts[lang][currentLevel as keyof WritingPromptsByLevel]) {
    const prompts = writingPrompts[lang][currentLevel as keyof WritingPromptsByLevel]
    const currentPromptData = prompts[currentPrompt]

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-4">
        <div className="max-w-4xl mx-auto">
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

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button onClick={() => setCurrentLevel(null)} variant="outline" className="bg-white/20 text-white border-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">{t.writing}</h1>
            <div className="text-white font-semibold">
              {t.level}: {currentLevel === 'beginner' ? t.beginner : currentLevel === 'intermediate' ? t.intermediate : t.advanced}
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
                  <strong>{t.instruction}:</strong> {currentPromptData.prompt}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-medium text-blue-800 mb-2">{t.hints}:</div>
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
                    {t.writingTips}
                  </Button>
                  
                  <div className="text-sm text-gray-600 flex items-center">
                    {t.objective}: {currentPromptData.wordCount} {t.wordGoal} (actuel: {wordCount})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writing Tips */}
          {showTips && (
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-xl text-yellow-800">{t.writingTipsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-yellow-700 space-y-2">
                  {writingTips[lang][currentLevel as keyof WritingTipsByLevel].map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Writing Area */}
          <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">{t.yourText}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder={t.startWriting}
                className="min-h-[300px] text-lg leading-relaxed resize-none"
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  {wordCount} {t.wordsWritten}
                </div>
                
                <Button 
                  onClick={evaluateWriting}
                  disabled={userText.trim().length === 0}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t.evaluate}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          {showEvaluation && (
            <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">{t.evaluation}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {evaluation.score >= 80 ? '🎉' : evaluation.score >= 60 ? '👍' : '💪'}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {t.score}: {evaluation.score}/100
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
                      {t.restart}
                    </Button>
                    
                    <Button 
                      onClick={nextPrompt}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {t.nextExercise}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div className="text-center text-white">
            <div className="text-lg">
              {t.exercise} {currentPrompt + 1} {t.of} {prompts.length}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
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

        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <Button onClick={onBack} variant="outline" className="absolute top-8 left-8 bg-white/20 text-white border-white/30">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.back}
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t.writing}</h1>
          <p className="text-xl text-white/90 drop-shadow">{t.developCreativity}</p>
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
              <CardTitle className="text-2xl text-gray-800">{t.beginner}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>{t.simpleDescriptions}</div>
                <div>{t.shortSentences}</div>
                <div>30-40 {t.wordGoal}</div>
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
              <CardTitle className="text-2xl text-gray-800">{t.intermediate}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>{t.shortStories}</div>
                <div>{t.logicalConnectors}</div>
                <div>70-80 {t.wordGoal}</div>
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
              <CardTitle className="text-2xl text-gray-800">{t.advanced}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>• {t.creativeStories}</div>
                <div>• Vocabulaire riche</div>
                <div>• 100-120 {t.wordGoal}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mt-8 bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Star className="h-6 w-6 text-yellow-500" />
              {t.progress}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {progress?.writing?.beginner || 0}
                </div>
                <div className="text-sm text-gray-600">{t.beginner}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {progress?.writing?.intermediate || 0}
                </div>
                <div className="text-sm text-gray-600">{t.intermediate}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {progress?.writing?.advanced || 0}
                </div>
                <div className="text-sm text-gray-600">{t.advanced}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 