"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Volume2, Check, BookOpen, RotateCcw, Star, Eye, Book } from "lucide-react"

interface ReadingExercisesProps {
  onBack: () => void
  progress: any
  setProgress: (progress: any) => void
  lang: 'fr' | 'es' | 'en'
  setLang: (lang: 'fr' | 'es' | 'en') => void
}

const translations = {
  fr: {
    reading: '📚 Lecture',
    back: 'Retour',
    level: 'Niveau',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    listenStory: 'Écouter l\'histoire',
    seeQuestions: 'Voir les questions',
    comprehensionQuestions: 'Questions de compréhension',
    yourAnswer: 'Ta réponse',
    checkAnswers: 'Vérifier mes réponses',
    results: 'Résultats',
    score: 'Score',
    correctAnswers: 'bonnes réponses',
    restart: 'Recommencer',
    nextStory: 'Histoire suivante',
    story: 'Histoire',
    of: 'sur',
    developComprehension: 'Développe ta compréhension !',
    simpleStories: 'Histoires simples',
    shortTexts: 'Textes courts',
    basicQuestions: 'Questions basiques',
    longerStories: 'Histoires plus longues',
    vocabulary: 'Vocabulaire enrichi',
    complexQuestions: 'Questions complexes',
    advancedStories: 'Histoires avancées',
    richVocabulary: 'Vocabulaire riche',
    detailedQuestions: 'Questions détaillées',
    progress: 'Mes Progrès en Lecture',
  },
  es: {
    reading: '📚 Lectura',
    back: 'Volver',
    level: 'Nivel',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    listenStory: 'Escuchar la historia',
    seeQuestions: 'Ver las preguntas',
    comprehensionQuestions: 'Preguntas de comprensión',
    yourAnswer: 'Tu respuesta',
    checkAnswers: 'Verificar mis respuestas',
    results: 'Resultados',
    score: 'Puntuación',
    correctAnswers: 'respuestas correctas',
    restart: 'Reiniciar',
    nextStory: 'Siguiente historia',
    story: 'Historia',
    of: 'de',
    developComprehension: '¡Desarrolla tu comprensión!',
    simpleStories: 'Historias simples',
    shortTexts: 'Textos cortos',
    basicQuestions: 'Preguntas básicas',
    longerStories: 'Historias más largas',
    vocabulary: 'Vocabulario enriquecido',
    complexQuestions: 'Preguntas complejas',
    advancedStories: 'Historias avanzadas',
    richVocabulary: 'Vocabulario rico',
    detailedQuestions: 'Preguntas detalladas',
    progress: 'Mi Progreso en Lectura',
  },
  en: {
    reading: '📚 Reading',
    back: 'Back',
    level: 'Level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    listenStory: 'Listen to the story',
    seeQuestions: 'See the questions',
    comprehensionQuestions: 'Comprehension questions',
    yourAnswer: 'Your answer',
    checkAnswers: 'Check my answers',
    results: 'Results',
    score: 'Score',
    correctAnswers: 'correct answers',
    restart: 'Restart',
    nextStory: 'Next story',
    story: 'Story',
    of: 'of',
    developComprehension: 'Develop your comprehension!',
    simpleStories: 'Simple stories',
    shortTexts: 'Short texts',
    basicQuestions: 'Basic questions',
    longerStories: 'Longer stories',
    vocabulary: 'Enriched vocabulary',
    complexQuestions: 'Complex questions',
    advancedStories: 'Advanced stories',
    richVocabulary: 'Rich vocabulary',
    detailedQuestions: 'Detailed questions',
    progress: 'My Reading Progress',
  },
}

type ReadingStory = {
  title: string;
  text: string;
  questions: { question: string; answer: string }[];
  theme: string;
  emoji: string;
};

type ReadingStoriesByLevel = {
  beginner: ReadingStory[];
  intermediate: ReadingStory[];
  advanced: ReadingStory[];
};

type ReadingStoriesByLang = {
  fr: ReadingStoriesByLevel;
  es: ReadingStoriesByLevel;
  en: ReadingStoriesByLevel;
};

const readingStories: ReadingStoriesByLang = {
  fr: {
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
  },
  es: {
    beginner: [
      {
        title: "El Gatito Curioso",
        text: "Había una vez un gatito llamado Mimi. Mimi le gustaba explorar el jardín detrás de su casa. Un día, descubrió un ratón que jugaba cerca de la huerta.",
        questions: [
          { question: "¿Cómo se llama el gatito?", answer: "Mimi" },
          { question: "¿Dónde le gustaba explorar a Mimi?", answer: "el jardín" },
          { question: "¿Qué descubrió Mimi?", answer: "un ratón" }
        ],
        theme: "animals",
        emoji: "🐱"
      },
      {
        title: "La Aventura de Tom el Robot",
        text: "Tom era un pequeño robot que vivía en una ciudad futurista. Tenía ojos azules brillantes y manos de metal. A Tom le gustaba ayudar a los otros robots.",
        questions: [
          { question: "¿Cómo se llama el robot?", answer: "Tom" },
          { question: "¿De qué color eran sus ojos?", answer: "azules" },
          { question: "¿Qué hacía Tom?", answer: "ayudaba a los otros robots" }
        ],
        theme: "robots",
        emoji: "🤖"
      }
    ],
    intermediate: [
      {
        title: "El Bosque Encantado",
        text: "En un bosque misterioso, vivía una familia de conejos mágicos. Los árboles hablaban y las flores cantaban. Un día, un conejito blanco descubrió un libro antiguo bajo un gran roble.",
        questions: [
          { question: "¿Quién vivía en el bosque?", answer: "una familia de conejos mágicos" },
          { question: "¿Qué hacían los árboles?", answer: "hablaban" },
          { question: "¿Qué descubrió el conejito?", answer: "un libro antiguo" }
        ],
        theme: "fantasy",
        emoji: "🌳"
      },
      {
        title: "El Viaje Espacial",
        text: "La astronauta Sara miraba por la ventana de su nave espacial. Veía la Tierra, azul y hermosa, desde el espacio. Las estrellas brillaban como diamantes en el cielo negro.",
        questions: [
          { question: "¿Cómo se llama la astronauta?", answer: "Sara" },
          { question: "¿Qué veía por la ventana?", answer: "la Tierra" },
          { question: "¿A qué se parecían las estrellas?", answer: "a diamantes" }
        ],
        theme: "space",
        emoji: "🚀"
      }
    ],
    advanced: [
      {
        title: "El Misterio del Castillo",
        text: "El joven detective Lucas caminaba por los pasillos oscuros del castillo abandonado. Ruidos extraños resonaban en las paredes. De repente, encontró una vieja llave de oro escondida detrás de un cuadro.",
        questions: [
          { question: "¿Cuál era el oficio de Lucas?", answer: "detective" },
          { question: "¿Dónde estaba Lucas?", answer: "en un castillo abandonado" },
          { question: "¿Qué encontró Lucas?", answer: "una vieja llave de oro" }
        ],
        theme: "mystery",
        emoji: "🏰"
      }
    ]
  },
  en: {
    beginner: [
      {
        title: "The Curious Little Cat",
        text: "Once upon a time, there was a little cat named Mimi. Mimi loved to explore the garden behind her house. One day, she discovered a mouse playing near the vegetable patch.",
        questions: [
          { question: "What is the little cat's name?", answer: "Mimi" },
          { question: "Where did Mimi like to explore?", answer: "the garden" },
          { question: "What did Mimi discover?", answer: "a mouse" }
        ],
        theme: "animals",
        emoji: "🐱"
      },
      {
        title: "Tom the Robot's Adventure",
        text: "Tom was a little robot who lived in a futuristic city. He had bright blue eyes and metal hands. Tom liked to help the other robots.",
        questions: [
          { question: "What is the robot's name?", answer: "Tom" },
          { question: "What color were his eyes?", answer: "blue" },
          { question: "What did Tom do?", answer: "helped the other robots" }
        ],
        theme: "robots",
        emoji: "🤖"
      }
    ],
    intermediate: [
      {
        title: "The Enchanted Forest",
        text: "In a mysterious forest lived a family of magical rabbits. The trees talked and the flowers sang. One day, a little white rabbit discovered an old book under a big oak tree.",
        questions: [
          { question: "Who lived in the forest?", answer: "a family of magical rabbits" },
          { question: "What did the trees do?", answer: "they talked" },
          { question: "What did the little rabbit discover?", answer: "an old book" }
        ],
        theme: "fantasy",
        emoji: "🌳"
      },
      {
        title: "The Space Journey",
        text: "Astronaut Sarah looked out the window of her spaceship. She saw the Earth, blue and beautiful, from space. The stars shone like diamonds in the black sky.",
        questions: [
          { question: "What is the astronaut's name?", answer: "Sarah" },
          { question: "What did she see out the window?", answer: "the Earth" },
          { question: "What did the stars look like?", answer: "diamonds" }
        ],
        theme: "space",
        emoji: "🚀"
      }
    ],
    advanced: [
      {
        title: "The Mystery of the Castle",
        text: "Young detective Lucas walked through the dark halls of the abandoned castle. Strange noises echoed in the walls. Suddenly, he found an old golden key hidden behind a painting.",
        questions: [
          { question: "What was Lucas's job?", answer: "detective" },
          { question: "Where was Lucas?", answer: "in an abandoned castle" },
          { question: "What did Lucas find?", answer: "an old golden key" }
        ],
        theme: "mystery",
        emoji: "🏰"
      }
    ]
  }
};

export default function ReadingExercises({ onBack, progress, setProgress, lang, setLang }: ReadingExercisesProps) {
  const [currentLevel, setCurrentLevel] = useState<string | null>(null)
  const [currentStory, setCurrentStory] = useState(0)
  const [showQuestions, setShowQuestions] = useState(false)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const t = translations[lang];

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
    const currentStoryData = readingStories[lang][currentLevel as keyof ReadingStoriesByLevel][currentStory]
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
    const stories = readingStories[lang][currentLevel as keyof ReadingStoriesByLevel]
    if (currentStory < stories.length - 1) {
      setCurrentStory(currentStory + 1)
      setShowQuestions(false)
      setUserAnswers([])
      setShowResults(false)
    } else {
      setCurrentLevel(null)
    }
  }

  if (currentLevel && readingStories[lang][currentLevel as keyof ReadingStoriesByLevel]) {
    const stories = readingStories[lang][currentLevel as keyof ReadingStoriesByLevel]
    const currentStoryData = stories[currentStory]

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
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
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">{t.reading}</h1>
            <div className="text-white font-semibold">
              {t.level}: {currentLevel === 'beginner' ? t.beginner : currentLevel === 'intermediate' ? t.intermediate : t.advanced}
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
                  {t.listenStory}
                </Button>
                
                {!showQuestions && (
                  <Button 
                    onClick={() => setShowQuestions(true)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t.seeQuestions}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          {showQuestions && !showResults && (
            <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">{t.comprehensionQuestions}</CardTitle>
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
                        placeholder={t.yourAnswer}
                      />
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={checkAnswers}
                  className="mt-6 bg-purple-500 hover:bg-purple-600 w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t.checkAnswers}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {showResults && (
            <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">{t.results}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪'}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {t.score}: {score}%
                  </div>
                  <div className="text-gray-600 mb-4">
                    {score >= 80 ? t.correctAnswers : score >= 60 ? 'Bon travail !' : 'Continue à t\'entraîner !'}
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
                      {t.restart}
                    </Button>
                    
                    <Button 
                      onClick={nextStory}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Book className="h-4 w-4 mr-2" />
                      {t.nextStory}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div className="text-center text-white">
            <div className="text-lg">
              {t.story} {currentStory + 1} {t.of} {stories.length}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
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
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t.reading}</h1>
          <p className="text-xl text-white/90 drop-shadow">{t.developComprehension}</p>
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
              <CardTitle className="text-2xl text-gray-800">{t.beginner}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>{t.simpleStories}</div>
                <div>{t.shortTexts}</div>
                <div>{t.basicQuestions}</div>
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
              <CardTitle className="text-2xl text-gray-800">{t.intermediate}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>{t.longerStories}</div>
                <div>{t.vocabulary}</div>
                <div>{t.detailedQuestions}</div>
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
              <CardTitle className="text-2xl text-gray-800">{t.advanced}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <div>{t.longerStories}</div>
                <div>{t.vocabulary}</div>
                <div>{t.complexQuestions}</div>
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
                <div className="text-2xl font-bold text-green-600">
                  {progress?.reading?.beginner || 0}
                </div>
                <div className="text-sm text-gray-600">{t.beginner}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progress?.reading?.intermediate || 0}
                </div>
                <div className="text-sm text-gray-600">{t.intermediate}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {progress?.reading?.advanced || 0}
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