"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Volume2, Check, BookOpen, RotateCcw, Star, Sparkles } from "lucide-react"
import { generateAIStory, fallbackContent } from "@/lib/ai-stories"
import { speakText, speakWithAccent, stopSpeech, isSpeaking } from "@/lib/text-to-speech"

interface ThemedLanguageExercisesProps {
  onBack: () => void
  progress: any
  setProgress: (progress: any) => void
  preSelectedHero?: string | null
  lang?: 'fr' | 'es' | 'en'
}

const languages = {
  catalan: { name: "Català", flag: "🇪🇸", color: "red" },
  french: { name: "Français", flag: "🇫🇷", color: "blue" },
  spanish: { name: "Castellano", flag: "🇪🇸", color: "yellow" },
  english: { name: "English", flag: "🇬🇧", color: "green" },
}

const themes = {
  captainUnderpants: { name: "Capitaine Superslip", emoji: "🦸‍♂️", color: "blue", image: "/hero-logos/captain-underpants.png" },
  hotWheels: { name: "Hot Wheels", emoji: "🏎️", color: "red", image: "/hero-logos/hot-wheels.png" },
  sonic: { name: "Sonic", emoji: "💙", color: "blue", image: "/hero-logos/sonic.png" },
  ninjago: { name: "Ninjago", emoji: "🥷", color: "green", image: "/hero-logos/ninjago.png" },
  pokemon: { name: "Pokémon", emoji: "⚡", color: "yellow", image: "/hero-logos/pokemon.png" },
  minecraft: { name: "Minecraft", emoji: "⛏️", color: "green", image: "/hero-logos/minecraft.png" },
}

const translations = {
  fr: {
    mainTitle: "🎭 Lectures Thématiques 🎭",
    subtitle: "Choisis ta langue préférée !",
    cardDesc: "Avec tes héros préférés !",
    exercises: (n: number) => `${n} exercices réussis`,
    languages: {
      catalan: "Català",
      french: "Français",
      spanish: "Castellano",
      english: "English"
    }
  },
  es: {
    mainTitle: "🎭 Lecturas Temáticas 🎭",
    subtitle: "¡Elige tu idioma preferido!",
    cardDesc: "¡Con tus héroes favoritos!",
    exercises: (n: number) => `${n} ejercicios completados`,
    languages: {
      catalan: "Català",
      french: "Francés",
      spanish: "Castellano",
      english: "Inglés"
    }
  },
  en: {
    mainTitle: "🎭 Themed Readings 🎭",
    subtitle: "Choose your preferred language!",
    cardDesc: "With your favorite heroes!",
    exercises: (n: number) => `${n} exercises completed`,
    languages: {
      catalan: "Catalan",
      french: "French",
      spanish: "Spanish",
      english: "English"
    }
  }
}

// Complete content for all languages and themes
const themedExercises = {
  catalan: {
    captainUnderpants: {
      listening: [
        {
          text: "El Capità Superslip vola pel cel amb els seus calçotets màgics. Avui ha rebut una trucada d'emergència de l'escola primària Jerome Horwitz.",
          question: "D'on ve la trucada d'emergència?",
          answer: "de l'escola Jerome Horwitz",
        },
      ],
      reading: [
        {
          title: "L'Aventura del Capità Superslip",
          text: "Era un matí normal a l'escola. En Jorge i en Harold estaven dibuixant còmics del Capità Superslip, el seu heroi favorit amb calçotets màgics.",
          questions: [
            { question: "Què estaven fent en Jorge i en Harold?", answer: "dibuixant còmics" },
            { question: "Com es diu el seu heroi favorit?", answer: "Capità Superslip" },
          ],
        },
      ],
      words: ["heroi", "calçotets", "aventura", "còmic", "escola"],
    },
    hotWheels: {
      listening: [
        {
          text: "El cotxe vermell de Hot Wheels corre per la pista a una velocitat increïble. En Marc ha construït una pista gegant al seu jardí.",
          question: "On ha construït en Marc la pista?",
          answer: "al seu jardí",
        },
      ],
      reading: [
        {
          title: "La Gran Carrera de Hot Wheels",
          text: "Era dissabte al matí i en Marc estava molt emocionat. Avui era el dia de la gran carrera de Hot Wheels al seu barri.",
          questions: [
            { question: "Quan era la carrera?", answer: "dissabte al matí" },
            { question: "On era la carrera?", answer: "al seu barri" },
          ],
        },
      ],
      words: ["cotxe", "pista", "velocitat", "carrera", "salt"],
    },
    sonic: {
      listening: [
        {
          text: "En Sonic corre tan ràpid com el llamp blau pel món de Green Hill Zone. El malvat Doctor Eggman ha robat tots els anells daurats.",
          question: "Què ha robat el Doctor Eggman?",
          answer: "els anells daurats",
        },
      ],
      reading: [
        {
          title: "Sonic i els Anells Màgics",
          text: "En Sonic es va despertar amb un so estrany. El Doctor Eggman havia robat tots els anells del món amb la seva màquina gegant.",
          questions: [
            { question: "Què va despertar en Sonic?", answer: "un so estrany" },
            { question: "Amb què havia robat els anells el Doctor Eggman?", answer: "la seva màquina gegant" },
          ],
        },
      ],
      words: ["ràpid", "anells", "aventura", "amic", "velocitat"],
    },
    ninjago: {
      listening: [
        {
          text: "Els ninjas de Ninjago entrenen cada dia amb el mestre Wu. En Lloyd està practicant el seu poder especial del drac daurat.",
          question: "Quin poder està practicant en Lloyd?",
          answer: "el poder del drac daurat",
        },
      ],
      reading: [
        {
          title: "Els Ninjas i el Temple",
          text: "Els quatre ninjas havien rebut una missió important del mestre Wu. Havien de trobar el Temple dels Quatre Elements.",
          questions: [
            { question: "Quants ninjas hi havia?", answer: "quatre" },
            { question: "Què havien de trobar?", answer: "el Temple dels Quatre Elements" },
          ],
        },
      ],
      words: ["ninja", "poder", "entrenament", "lluita", "equip"],
    },
    pokemon: {
      listening: [
        {
          text: "En Pikachu és el Pokémon més famós. Amb les seves galtes grogues pot generar electricitat molt potent.",
          question: "Què pot generar en Pikachu?",
          answer: "electricitat",
        },
      ],
      reading: [
        {
          title: "Ash i Pikachu",
          text: "Era el primer dia d'en Ash com a entrenador Pokémon. Al laboratori només quedava en Pikachu, un Pokémon elèctric especial.",
          questions: [
            { question: "Quin era el primer dia d'en Ash?", answer: "com a entrenador Pokémon" },
            { question: "Quin Pokémon quedava?", answer: "Pikachu" },
          ],
        },
      ],
      words: ["pokemon", "entrenador", "batalla", "amistat", "aventura"],
    },
    minecraft: {
      listening: [
        {
          text: "En Steve es desperta al seu món de Minecraft quan surt el sol. Ha construït una casa nova amb blocs de fusta i pedra.",
          question: "Amb què ha construït la casa?",
          answer: "blocs de fusta i pedra",
        },
      ],
      reading: [
        {
          title: "Steve i Alex al Nether",
          text: "Steve i Alex es preparaven per la seva aventura més perillosa: viatjar al Nether amb un portal màgic d'obsidiana.",
          questions: [
            { question: "On Wanted to travel?", answer: "al Nether" },
            { question: "How were they going to travel?", answer: "with a magic portal" },
          ],
        },
      ],
      words: ["bloc", "picoleta", "creeper", "diamant", "construcció"],
    },
  },
  french: {
    captainUnderpants: {
      listening: [
        {
          text: "Le Capitaine Superslip vole dans le ciel avec son slip magique. Aujourd'hui, il a reçu un appel d'urgence de l'école Jerome Horwitz.",
          question: "D'où vient l'appel d'urgence?",
          answer: "de l'école Jerome Horwitz",
        },
      ],
      reading: [
        {
          title: "L'Aventure du Capitaine Superslip",
          text: "C'était un matin normal à l'école. Georges et Harold dessinaient des bandes dessinées du Capitaine Superslip, leur héros préféré.",
          questions: [
            { question: "Que faisaient Georges et Harold?", answer: "ils dessinaient des bandes dessinées" },
            { question: "Qui était leur héros préféré?", answer: "le Capitaine Superslip" },
          ],
        },
      ],
      words: ["héros", "slip", "aventure", "bande dessinée", "école"],
    },
    hotWheels: {
      listening: [
        {
          text: "La voiture rouge Hot Wheels roule sur la piste à une vitesse incroyable. Marc a construit une piste géante dans son jardin.",
          question: "Où Marc a-t-il construit la piste?",
          answer: "dans son jardin",
        },
      ],
      reading: [
        {
          title: "La Grande Course Hot Wheels",
          text: "C'était samedi matin et Marc était très excité. Aujourd'hui était le jour de la grande course Hot Wheels dans son quartier.",
          questions: [
            { question: "Quel jour était-ce?", answer: "samedi matin" },
            { question: "Où avait lieu la course?", answer: "dans son quartier" },
          ],
        },
      ],
      words: ["voiture", "piste", "vitesse", "course", "saut"],
    },
    sonic: {
      listening: [
        {
          text: "Sonic court aussi vite que l'éclair bleu à travers Green Hill Zone. Le méchant Docteur Eggman a volé tous les anneaux dorés.",
          question: "Qu'a volé le Docteur Eggman?",
          answer: "tous les anneaux dorés",
        },
      ],
      reading: [
        {
          title: "Sonic et les Anneaux Magiques",
          text: "Sonic se réveilla avec un bruit étrange. Le Docteur Eggman avait volé tous les anneaux du monde avec sa machine géante.",
          questions: [
            { question: "Qu'est-ce qui a réveillé Sonic?", answer: "un bruit étrange" },
            { question: "Avec quoi le Docteur Eggman avait-il volé les anneaux?", answer: "sa machine géante" },
          ],
        },
      ],
      words: ["rapide", "anneaux", "aventure", "ami", "vitesse"],
    },
    ninjago: {
      listening: [
        {
          text: "Les ninjas de Ninjago s'entraînent chaque jour avec le maître Wu. Lloyd pratique son pouvoir spécial du dragon doré.",
          question: "Quel pouvoir pratique Lloyd?",
          answer: "le pouvoir du dragon doré",
        },
      ],
      reading: [
        {
          title: "Les Ninjas et le Temple",
          text: "Les quatre ninjas avaient reçu une mission importante du maître Wu. Ils devaient trouver le Temple des Quatre Éléments.",
          questions: [
            { question: "Combien y avait-il de ninjas?", answer: "quatre" },
            { question: "Qué devaient-ils trouver?", answer: "le Temple des Quatre Éléments" },
          ],
        },
      ],
      words: ["ninja", "pouvoir", "entraînement", "combat", "équipe"],
    },
    pokemon: {
      listening: [
        {
          text: "Pikachu est le Pokémon le plus célèbre. Avec ses joues jaunes, il peut générer de l'électricité très puissante.",
          question: "Que peut générer Pikachu?",
          answer: "de l'électricité",
        },
      ],
      reading: [
        {
          title: "Sacha et Pikachu",
          text: "C'était le premier jour de Sacha en tant qu'entraîneur Pokémon. Au laboratoire, il ne restait que Pikachu, un Pokémon électrique spécial.",
          questions: [
            { question: "Quel était le premier jour de Sacha?", answer: "en tant qu'entraîneur Pokémon" },
            { question: "Quel Pokémon restait-il?", answer: "Pikachu" },
          ],
        },
      ],
      words: ["pokémon", "entraîneur", "bataille", "amitié", "aventure"],
    },
    minecraft: {
      listening: [
        {
          text: "Steve se réveille dans son monde Minecraft quand le soleil se lève. Ha construït une nouvelle maison avec des blocs de bois.",
          question: "Avec quoi Steve a-t-il construit sa maison?",
          answer: "des blocs de bois",
        },
      ],
      reading: [
        {
          title: "Steve et Alex dans le Nether",
          text: "Steve et Alex se préparaient pour leur aventure més dangereuse : voyager dans le Nether avec un portail màgic d'obsidiana.",
          questions: [
            { question: "Où voulaient-ils voyager?", answer: "dans le Nether" },
            { question: "Comment allaient-ils voyager?", answer: "avec un portail màgic" },
          ],
        },
      ],
      words: ["bloc", "picoleta", "creeper", "diamant", "construcció"],
    },
  },
  spanish: {
    captainUnderpants: {
      listening: [
        {
          text: "El Capitán Calzoncillos vuela por el cielo con sus calzoncillos mágicos. Hoy ha recibido una llamada de emergencia de la escuela.",
          question: "¿De dónde viene la llamada de emergencia?",
          answer: "de la escuela",
        },
      ],
      reading: [
        {
          title: "La Aventura del Capitán Calzoncillos",
          text: "Era una mañana normal en la escuela. Jorge y Berto estaban dibujando cómics del Capitán Calzoncillos, su héroe favorito.",
          questions: [
            { question: "¿Qué hacían Jorge y Berto?", answer: "dibujaban cómics" },
            { question: "¿Quién era su héroe favorito?", answer: "el Capitán Calzoncillos" },
          ],
        },
      ],
      words: ["héroe", "calzoncillos", "aventura", "cómic", "escuela"],
    },
    hotWheels: {
      listening: [
        {
          text: "El coche rojo de Hot Wheels corre por la pista a velocidad increíble. Marco ha construido una pista gigante en su jardín.",
          question: "¿Dónde construyó Marco la pista?",
          answer: "en su jardín",
        },
      ],
      reading: [
        {
          title: "La Gran Carrera de Hot Wheels",
          text: "Era sábado por la mañana y Marco estaba muy emocionado. Hoy era el día de la gran carrera de Hot Wheels en su barrio.",
          questions: [
            { question: "¿Qué día era?", answer: "sábado por la mañana" },
            { question: "¿Dónde era la carrera?", answer: "en su barrio" },
          ],
        },
      ],
      words: ["coche", "pista", "velocidad", "carrera", "salto"],
    },
    sonic: {
      listening: [
        {
          text: "Sonic corre tan rápido como el rayo azul por Green Hill Zone. El malvado Doctor Eggman ha robado todos los anillos dorados.",
          question: "¿Qué ha robado el Doctor Eggman?",
          answer: "los anillos dorados",
        },
      ],
      reading: [
        {
          title: "Sonic y los Anillos Mágicos",
          text: "Sonic se despertó con un ruido extraño. El Doctor Eggman había robado todos los anillos del mundo con su máquina géante.",
          questions: [
            { question: "¿Qué despertó a Sonic?", answer: "un ruido extraño" },
            { question: "¿Con qué robó los anillos el Doctor Eggman?", answer: "su máquina géante" },
          ],
        },
      ],
      words: ["rápido", "anillos", "aventura", "amigo", "velocidad"],
    },
    ninjago: {
      listening: [
        {
          text: "Los ninjas de Ninjago entrenan cada día con el maestro Wu. Lloyd practica su poder especial del dragón dorado.",
          question: "¿Qué poder practica Lloyd?",
          answer: "el poder del dragón dorado",
        },
      ],
      reading: [
        {
          title: "Los Ninjas y el Templo",
          text: "Los cuatro ninjas habían recibido una misión importante del maestro Wu. Debían encontrar el Templo de los Cuatro Elementos.",
          questions: [
            { question: "¿Cuántos ninjas había?", answer: "cuatro" },
            { question: "¿Qué debían encontrar?", answer: "el Templo de los Cuatro Elementos" },
          ],
        },
      ],
      words: ["ninja", "poder", "entrenamiento", "combate", "équipe"],
    },
    pokemon: {
      listening: [
        {
          text: "Pikachu es el Pokémon más famoso. Con sus mejillas amarillas puede generar electricidad muy poderosa.",
          question: "¿Qué puede generar Pikachu?",
          answer: "electricidad",
        },
      ],
      reading: [
        {
          title: "Ash y Pikachu",
          text: "Era el primer día de Ash como entrenador Pokémon. En el laboratorio, solo quedaba Pikachu, un Pokémon eléctrico especial.",
          questions: [
            { question: "¿Cuál era el primer día de Ash?", answer: "como entrenador Pokémon" },
            { question: "¿Qué Pokémon restaba?", answer: "Pikachu" },
          ],
        },
      ],
      words: ["pokémon", "entrenador", "batalla", "amistad", "aventura"],
    },
    minecraft: {
      listening: [
        {
          text: "Steve se despierta en su mundo Minecraft cuando sale el sol. Ha construido una casa nueva con bloques de madera y piedra.",
          question: "¿Con qué construyó Steve su casa?",
          answer: "bloques de madera y piedra",
        },
      ],
      reading: [
        {
          title: "Steve y Alex en el Nether",
          text: "Steve y Alex se preparaban para su aventura más peligrosa: viajar al Nether con un portail mágico.",
          questions: [
            { question: "¿Adónde querían viajar?", answer: "dans le Nether" },
            { question: "¿Con qué iban a viajar?", answer: "con un portail mágico" },
          ],
        },
      ],
      words: ["bloque", "picoleta", "creeper", "diamante", "construcción"],
    },
  },
  english: {
    captainUnderpants: {
      listening: [
        {
          text: "Captain Underpants flies through the sky with his magic underwear. Today he received an emergency call from Jerome Horwitz Elementary School.",
          question: "Where did the emergency call come from?",
          answer: "Jerome Horwitz Elementary School",
        },
      ],
      reading: [
        {
          title: "Captain Underpants Adventure",
          text: "It was a normal morning at school. George and Harold were drawing comics of Captain Underpants, their favorite hero.",
          questions: [
            { question: "What were George and Harold doing?", answer: "drawing comics" },
            { question: "Who was their favorite hero?", answer: "Captain Underpants" },
          ],
        },
      ],
      words: ["hero", "underwear", "adventure", "comic", "school"],
    },
    hotWheels: {
      listening: [
        {
          text: "The red Hot Wheels car races down the track at incredible speed. Mark built a giant track in his backyard with curves and jumps.",
          question: "Where did Mark build the track?",
          answer: "in his backyard",
        },
      ],
      reading: [
        {
          title: "The Great Hot Wheels Race",
          text: "It was Saturday morning and Mark was very excited. Today was the day of the great Hot Wheels race in his neighborhood.",
          questions: [
            { question: "What day was it?", answer: "Saturday morning" },
            { question: "Where was the race?", answer: "in his neighborhood" },
          ],
        },
      ],
      words: ["car", "track", "speed", "race", "jump"],
    },
    sonic: {
      listening: [
        {
          text: "Sonic runs as fast as blue lightning through Green Hill Zone. The evil Doctor Eggman has stolen all the golden rings.",
          question: "What did Doctor Eggman steal?",
          answer: "the golden rings",
        },
      ],
      reading: [
        {
          title: "Sonic and the Magic Rings",
          text: "Sonic woke up to a strange noise. Doctor Eggman had stolen all the rings in the world with his giant machine.",
          questions: [
            { question: "What woke up Sonic?", answer: "a strange noise" },
            { question: "What did Doctor Eggman use to steal the rings?", answer: "his giant machine" },
          ],
        },
      ],
      words: ["fast", "rings", "adventure", "friend", "speed"],
    },
    ninjago: {
      listening: [
        {
          text: "The ninjas of Ninjago train every day with Master Wu. Lloyd practices his special golden dragon power.",
          question: "What power does Lloyd practice?",
          answer: "the golden dragon power",
        },
      ],
      reading: [
        {
          title: "The Ninjas and the Temple",
          text: "The four ninjas had received an important mission from Master Wu. They had to find the Temple of the Four Elements.",
          questions: [
            { question: "How many ninjas were there?", answer: "four" },
            { question: "What did they have to find?", answer: "the Temple of the Four Elements" },
          ],
        },
      ],
      words: ["ninja", "power", "training", "combat", "team"],
    },
    pokemon: {
      listening: [
        {
          text: "Pikachu is the most famous Pokémon. With his yellow cheeks, he can generate very powerful electricity.",
          question: "What can Pikachu generate?",
          answer: "electricity",
        },
      ],
      reading: [
        {
          title: "Ash and Pikachu",
          text: "It was Ash's first day as a Pokémon trainer. At the laboratory, only Pikachu remained, a special electric Pokémon.",
          questions: [
            { question: "What was Ash's first day?", answer: "as a Pokémon trainer" },
            { question: "What Pokémon remained?", answer: "Pikachu" },
          ],
        },
      ],
      words: ["pokemon", "trainer", "battle", "friendship", "adventure"],
    },
    minecraft: {
      listening: [
        {
          text: "Steve wakes up in his Minecraft world when the sun rises. He built a new house with wood and stone blocks.",
          question: "What did Steve build his house with?",
          answer: "wood and stone blocks",
        },
      ],
      reading: [
        {
          title: "Steve and Alex in the Nether",
          text: "Steve and Alex were preparing for their most dangerous adventure: traveling to the Nether with a magic portal.",
          questions: [
            { question: "Where did they want to travel?", answer: "to the Nether" },
            { question: "How were they going to travel?", answer: "with a magic portal" },
          ],
        },
      ],
      words: ["block", "pickaxe", "creeper", "diamond", "construction"],
    },
  },
}

// Safe accessor function
function safeThemeData(lang: keyof typeof themedExercises | null, theme: string | null) {
  if (!lang || !theme) return { listening: [], reading: [], words: [] }

  const langData = themedExercises[lang] as
    | Record<string, { listening: any[]; reading: any[]; words: any[] }>
    | undefined
  return langData?.[theme] ?? { listening: [], reading: [], words: [] }
}

export default function ThemedLanguageExercises({ onBack, progress, setProgress, preSelectedHero, lang = 'fr' }: ThemedLanguageExercisesProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [exerciseType, setExerciseType] = useState<string | null>(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [useAI, setUseAI] = useState(false)
  const [aiContent, setAiContent] = useState<any>(null)
  const [userAnswer, setUserAnswer] = useState("")

  // Apple Pencil Pro states
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [pencilPressure, setPencilPressure] = useState(0.5)
  const [pencilTilt, setPencilTilt] = useState(0)

  // Reset all exercise state
  const resetExerciseState = () => {
    setCurrentExercise(0)
    setCurrentQuestionIndex(0)
    setShowResult(false)
    setIsCorrect(false)
    setScore(0)
    setUseAI(false)
    setAiContent(null)
    setUserAnswer("")
    clearCanvas()
  }

  // Reset state when changing theme
  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme)
    setExerciseType(null)
    resetExerciseState()
  }

  // Reset state when changing exercise type
  const handleExerciseTypeChange = (type: string) => {
    setExerciseType(type)
    resetExerciseState()
  }

  // Auto-select hero if provided
  useEffect(() => {
    if (preSelectedHero) {
      handleThemeChange(preSelectedHero)
    }
  }, [preSelectedHero])

  // Reset AI content when language changes
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    
    // If a hero is pre-selected, skip theme selection and go directly to exercise types
    if (preSelectedHero) {
      setSelectedTheme(preSelectedHero)
      setExerciseType(null)
      resetExerciseState()
    } else {
      // Only reset theme if no hero is pre-selected
      setSelectedTheme(null)
      setExerciseType(null)
      resetExerciseState()
    }
  }

  // Enhanced Text-to-Speech function with local accents
  const speakTextWithAccent = (text: string, lang: string, accent: 'standard' | 'local' | 'child' = 'standard') => {
    // Stop any current speech first
    stopSpeech()
    
    // Use the new TTS utility with accent selection
    speakWithAccent(text, lang, accent).catch(error => {
      console.error('Speech synthesis error:', error)
      // Fallback to basic speech synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        const langCodes = {
          catalan: "ca-ES",
          french: "fr-FR",
          spanish: "es-ES",
          english: "en-US",
        }
        utterance.lang = langCodes[lang as keyof typeof langCodes]
        utterance.rate = 0.7
        speechSynthesis.speak(utterance)
      }
    })
  }

  // Speak text with standard accent
  const speakText = (text: string, lang: string) => {
    speakTextWithAccent(text, lang, 'standard')
  }

  // Optimized Apple Pencil drawing functions
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match display size for crisp drawing
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const pressure = e.pressure || 0.5
    const tiltX = e.tiltX || 0
    const tiltY = e.tiltY || 0

    setPencilPressure(pressure)
    setPencilTilt(Math.sqrt(tiltX * tiltX + tiltY * tiltY))

    const isEraserSide = e.pointerType === "pen" && (Math.abs(tiltX) > 60 || Math.abs(tiltY) > 60)
    setIsErasing(isEraserSide)

    if (isEraserSide) {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = 20
    } else {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = "#2563eb"
      ctx.lineWidth = Math.max(1, pressure * 6)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
    }

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pressure = e.pressure || 0.5
    setPencilPressure(pressure)

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (!isErasing) {
      ctx.lineWidth = Math.max(1, pressure * 6)
      ctx.globalAlpha = Math.max(0.3, pressure)
    }

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setIsErasing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const generateNewStory = async () => {
    if (!selectedLanguage || !selectedTheme || !exerciseType) return
    
    setIsGenerating(true)
    try {
      const aiStory = await generateAIStory({
        language: selectedLanguage,
        theme: selectedTheme,
        exerciseType: exerciseType as any,
        difficulty: 'beginner'
      })
      setAiContent(aiStory)
      setUseAI(true)
      setShowResult(false)
      setCurrentQuestionIndex(0)
      setUserAnswer("")
      clearCanvas()
    } catch (error) {
      console.error('Failed to generate AI story:', error)
      // Fallback to predefined content
      setUseAI(false)
      setAiContent(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const getCurrentExerciseData = () => {
    if (useAI && aiContent) {
      return aiContent
    }
    
    const themeData = safeThemeData(selectedLanguage as any, selectedTheme as any)
    if (exerciseType === 'listening') {
      return themeData.listening[currentExercise] || fallbackContent.listening
    } else if (exerciseType === 'reading') {
      return themeData.reading[currentExercise] || fallbackContent.reading
    } else if (exerciseType === 'writing') {
      return { words: themeData.words, prompt: fallbackContent.writing.prompt }
    }
    return null
  }

  const checkAnswer = () => {
    const exercise = getCurrentExerciseData()
    if (!exercise) return

    let correctAnswer = ""
    let userAnswerText = userAnswer.trim().toLowerCase()

    if (exerciseType === 'listening') {
      correctAnswer = exercise.answer.toLowerCase()
    } else if (exerciseType === 'reading') {
      correctAnswer = exercise.questions[currentQuestionIndex].answer.toLowerCase()
    }

    // Simple answer verification - check if user answer contains key words from correct answer
    const correctWords = correctAnswer.split(' ').filter(word => word.length > 2)
    const userWords = userAnswerText.split(' ').filter(word => word.length > 2)
    
    const matchingWords = correctWords.filter(word => 
      userWords.some(userWord => 
        userWord.includes(word) || word.includes(userWord)
      )
    )

    const accuracy = matchingWords.length / correctWords.length
    const isAnswerCorrect = accuracy >= 0.5 || userAnswerText.includes(correctAnswer) || correctAnswer.includes(userAnswerText)

    setIsCorrect(isAnswerCorrect)
    setShowResult(true)
    
    if (isAnswerCorrect) {
      setScore(score + 1)
      setProgress((prev: any) => ({
        ...prev,
        languages: {
          ...prev.languages,
          [selectedLanguage!]: prev.languages[selectedLanguage!] + 1,
        },
      }))
    }
  }

  const nextExercise = () => {
    if (!selectedLanguage || !selectedTheme) return

    const themeData = safeThemeData(selectedLanguage as any, selectedTheme as any)

    if (exerciseType === "reading") {
      const reading = themeData.reading[currentExercise]
      if (reading && currentQuestionIndex < reading.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setShowResult(false)
        setUserAnswer("")
        clearCanvas()
        return
      }
    }

    const maxExercises = themeData[exerciseType as keyof typeof themeData]?.length || 0

    if (currentExercise < maxExercises - 1) {
      setCurrentExercise(currentExercise + 1)
      setCurrentQuestionIndex(0)
      setShowResult(false)
      setUserAnswer("")
      clearCanvas()
    } else {
      alert(`Bravo ! Tu as terminé les aventures de ${themes[selectedTheme as keyof typeof themes].name} !`)
      setSelectedLanguage(null)
      setSelectedTheme(null)
      setExerciseType(null)
      setCurrentExercise(0)
      setCurrentQuestionIndex(0)
      setScore(0)
      setUseAI(false)
      setAiContent(null)
    }
  }

  // Language selection screen
  if (!selectedLanguage) {
    const t = translations[lang]
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {lang === 'fr' ? 'Retour' : lang === 'es' ? 'Volver' : 'Back'}
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t.mainTitle}</h1>
            <p className="text-xl text-white/90 drop-shadow">{t.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(languages).map(([key, langObj]) => (
              <Card
                key={key}
                className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleLanguageChange(key)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">{langObj.flag}</span>
                  </div>
                  <CardTitle className="text-2xl text-gray-800">{t.languages[key as keyof typeof t.languages]}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex justify-center items-center gap-2 text-sm text-gray-600 mb-4">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{t.exercises(progress.languages[key as keyof typeof t.languages])}</span>
                  </div>
                  <p className="text-sm text-gray-600">{t.cardDesc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Theme selection screen
  if (!selectedTheme) {
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
              {languages[selectedLanguage as keyof typeof languages].flag} Choisis ton héros !
            </h1>
            <p className="text-xl text-white/90 drop-shadow">Quel univers veux-tu explorer ?</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(themes).map(([key, theme]) => (
              <Card
                key={key}
                className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleThemeChange(key)}
              >
                <CardHeader className="text-center">
                  <div 
                    className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 relative overflow-hidden"
                    style={{
                      backgroundImage: `url(${theme.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.backgroundColor = '#22c55e';
                      target.style.backgroundImage = 'none';
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30 rounded-full"></div>
                  </div>
                  <CardTitle className="text-xl text-gray-800">{theme.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">Aventures avec {theme.name} !</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Exercise type selection
  if (!exerciseType) {
    const data = safeThemeData(selectedLanguage as any, selectedTheme as any)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <span className="mr-2">🏠</span> Accueil
            </Button>
            <Button
              onClick={() => preSelectedHero ? setSelectedLanguage(null) : setSelectedTheme(null)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {themes[selectedTheme as keyof typeof themes].emoji} {themes[selectedTheme as keyof typeof themes].name}
            </h1>
            <p className="text-xl text-white/90 drop-shadow">Choisis ton exercice !</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => handleExerciseTypeChange("listening")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Volume2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Écoute</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="text-sm font-medium">{data.listening.length} histoires</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => handleExerciseTypeChange("reading")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Lecture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <span className="text-sm font-medium">{data.reading.length} histoires</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => handleExerciseTypeChange("writing")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-white">✏️</span>
                </div>
                <CardTitle className="text-2xl text-gray-800">Écriture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <span className="text-sm font-medium">{data.words.length} mots</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Exercise screens would continue here with proper data handling...
  // For brevity, I'll show the structure for one exercise type

  if (exerciseType === "listening") {
    const exercise = getCurrentExerciseData()

    if (!exercise) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 flex items-center justify-center">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl p-8">
            <p className="text-center text-gray-800">Aucun exercice disponible pour ce thème.</p>
            <Button onClick={() => setExerciseType(null)} className="mt-4 w-full">
              Retour
            </Button>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <span className="mr-2">🏠</span> Accueil
            </Button>
            <Button
              onClick={() => setExerciseType(null)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
                {themes[selectedTheme as keyof typeof themes].emoji}
                <Volume2 className="h-6 w-6" />
                Écoute et Réponds
                {useAI && <Sparkles className="h-5 w-5 text-purple-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-gray-100 p-6 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{exercise.text}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => speakTextWithAccent(exercise.text, selectedLanguage!, 'local')}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4"
                  >
                    <Volume2 className="h-6 w-6 mr-2" />
                    {selectedLanguage === 'french' && "Écouter l'histoire"}
                    {selectedLanguage === 'spanish' && "Escuchar la historia"}
                    {selectedLanguage === 'english' && "Listen to the story"}
                    {selectedLanguage === 'catalan' && "Escoltar la història"}
                  </Button>
                  
                  <Button
                    onClick={generateNewStory}
                    disabled={isGenerating}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-lg px-6 py-4"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {isGenerating ? "Génération..." : "Nouvelle histoire"}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-lg font-medium text-center text-gray-800">{exercise.question}</p>
                  <Button
                    onClick={() => speakTextWithAccent(exercise.question, selectedLanguage!, 'child')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2"
                    size="sm"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">✏️ Écris ta réponse</h3>
                  <Button size="sm" onClick={clearCanvas} className="bg-gray-500 hover:bg-gray-600 text-white">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Effacer
                  </Button>
                </div>

                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full border-2 border-dashed border-gray-300 rounded cursor-crosshair touch-none bg-white mb-4"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    style={{ touchAction: "none" }}
                  />
                  
                  {/* Text input overlay */}
                  <div
                    className="absolute inset-0 p-4 text-lg text-gray-700 bg-transparent border-none outline-none resize-none cursor-text"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setUserAnswer(e.currentTarget.textContent || "")}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        checkAnswer()
                      }
                    }}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      lineHeight: '1.5',
                      minHeight: '200px',
                      pointerEvents: 'auto'
                    }}
                    data-placeholder="Écris ta réponse ici ou dessine avec le crayon..."
                    aria-label="Zone de réponse - écris ou dessine ici"
                  />
                </div>

                <div className="flex justify-between items-center mt-3 p-2 bg-gray-50 rounded text-sm mb-4">
                  <span>
                    📏 Pression: <strong>{Math.round(pencilPressure * 100)}%</strong>
                  </span>
                  <span>
                    📐 Inclinaison: <strong>{Math.round(pencilTilt)}°</strong>
                  </span>
                  <span>{isErasing ? "🧽 Gomme" : "✏️ Écriture"}</span>
                </div>
              </div>

              {!showResult ? (
                <Button
                  onClick={checkAnswer}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-3"
                >
                  Vérifier ma réponse
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg text-center ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-6 w-6" />
                      <span className="text-lg font-bold">
                        {isCorrect ? "Excellent !" : "Pas tout à fait..."}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="mt-2 text-sm">
                        <p>Ta réponse : <strong>"{userAnswer}"</strong></p>
                        <p>Réponse correcte : <strong>"{exercise.answer}"</strong></p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={generateNewStory}
                      disabled={isGenerating}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-lg py-3"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      {isGenerating ? "Génération..." : "Nouvelle histoire"}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setUseAI(false)
                        setAiContent(null)
                        setShowResult(false)
                        setUserAnswer("")
                        clearCanvas()
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-lg py-3"
                    >
                      Histoire classique
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                Score : {score} / {currentExercise + (showResult && isCorrect ? 1 : 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (exerciseType === "reading") {
    const exercise = getCurrentExerciseData()

    if (!exercise) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 flex items-center justify-center">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl p-8">
            <p className="text-center text-gray-800">Aucun exercice disponible pour ce thème.</p>
            <Button onClick={() => setExerciseType(null)} className="mt-4 w-full">
              Retour
            </Button>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <span className="mr-2">🏠</span> Accueil
            </Button>
            <Button
              onClick={() => setExerciseType(null)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
                {themes[selectedTheme as keyof typeof themes].emoji}
                <BookOpen className="h-6 w-6" />
                Lecture et Compréhension
                {useAI && <Sparkles className="h-5 w-5 text-purple-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{exercise.title}</h3>
                <div className="bg-gray-100 p-6 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{exercise.text}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => speakTextWithAccent(exercise.text, selectedLanguage!, 'local')}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-lg px-8 py-4"
                  >
                    <Volume2 className="h-6 w-6 mr-2" />
                    {selectedLanguage === 'french' && "Écouter l'histoire"}
                    {selectedLanguage === 'spanish' && "Escuchar la historia"}
                    {selectedLanguage === 'english' && "Listen to the story"}
                    {selectedLanguage === 'catalan' && "Escoltar la història"}
                  </Button>
                  
                  <Button
                    onClick={generateNewStory}
                    disabled={isGenerating}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-lg px-6 py-4"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {isGenerating ? "Génération..." : "Nouvelle histoire"}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-lg font-medium text-center text-gray-800">
                    Question {currentQuestionIndex + 1} : {exercise.questions[currentQuestionIndex].question}
                  </p>
                  <Button
                    onClick={() => speakTextWithAccent(exercise.questions[currentQuestionIndex].question, selectedLanguage!, 'child')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2"
                    size="sm"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">✏️ Écris ta réponse</h3>
                  <Button size="sm" onClick={clearCanvas} className="bg-gray-500 hover:bg-gray-600 text-white">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Effacer
                  </Button>
                </div>

                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full border-2 border-dashed border-gray-300 rounded cursor-crosshair touch-none bg-white mb-4"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    style={{ touchAction: "none" }}
                  />
                  
                  {/* Text input overlay */}
                  <div
                    className="absolute inset-0 p-4 text-lg text-gray-700 bg-transparent border-none outline-none resize-none cursor-text"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setUserAnswer(e.currentTarget.textContent || "")}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        checkAnswer()
                      }
                    }}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      lineHeight: '1.5',
                      minHeight: '200px',
                      pointerEvents: 'auto'
                    }}
                    data-placeholder="Écris ta réponse ici ou dessine avec le crayon..."
                    aria-label="Zone de réponse - écris ou dessine ici"
                  />
                </div>

                <div className="flex justify-between items-center mt-3 p-2 bg-gray-50 rounded text-sm mb-4">
                  <span>
                    📏 Pression: <strong>{Math.round(pencilPressure * 100)}%</strong>
                  </span>
                  <span>
                    📐 Inclinaison: <strong>{Math.round(pencilTilt)}°</strong>
                  </span>
                  <span>{isErasing ? "🧽 Gomme" : "✏️ Écriture"}</span>
                </div>
              </div>

              {!showResult ? (
                <Button
                  onClick={checkAnswer}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-3"
                >
                  Vérifier ma réponse
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg text-center ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-6 w-6" />
                      <span className="text-lg font-bold">
                        {isCorrect ? "Excellent !" : "Pas tout à fait..."}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="mt-2 text-sm">
                        <p>Ta réponse : <strong>"{userAnswer}"</strong></p>
                        <p>Réponse correcte : <strong>"{exercise.questions[currentQuestionIndex].answer}"</strong></p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={generateNewStory}
                      disabled={isGenerating}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-lg py-3"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      {isGenerating ? "Génération..." : "Nouvelle histoire"}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setUseAI(false)
                        setAiContent(null)
                        setShowResult(false)
                        setUserAnswer("")
                        clearCanvas()
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-lg py-3"
                    >
                      Histoire classique
                    </Button>
                  </div>
                </div>
              )}

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
    const exercise = getCurrentExerciseData()
    const words = useAI && aiContent ? aiContent.words : safeThemeData(selectedLanguage as any, selectedTheme as any).words

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <span className="mr-2">🏠</span> Accueil
            </Button>
            <Button
              onClick={() => setExerciseType(null)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
                {themes[selectedTheme as keyof typeof themes].emoji}
                <span className="text-2xl">✏️</span>
                Écriture Créative
                {useAI && <Sparkles className="h-5 w-5 text-purple-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-blue-100 p-6 rounded-lg mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Utilise ces mots dans ton histoire :</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {words.map((word: string, index: number) => (
                      <span
                        key={index}
                        className="bg-white px-3 py-1 rounded-full text-sm font-medium text-blue-600 border border-blue-200"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                
                {useAI && aiContent && (
                  <div className="bg-purple-100 p-4 rounded-lg mb-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">💡 Suggestion d'écriture :</h4>
                    <p className="text-gray-700">{aiContent.prompt}</p>
                  </div>
                )}
                
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={generateNewStory}
                    disabled={isGenerating}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-lg px-6 py-4"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {isGenerating ? "Génération..." : "Nouveaux mots"}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setUseAI(false)
                      setAiContent(null)
                      clearCanvas()
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-lg px-6 py-4"
                  >
                    Mots classiques
                  </Button>
                </div>
              </div>

              <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">✏️ Écris ton histoire</h3>
                  <Button size="sm" onClick={clearCanvas} className="bg-gray-500 hover:bg-gray-600 text-white">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Effacer
                  </Button>
                </div>

                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className="w-full border-2 border-dashed border-gray-300 rounded cursor-crosshair touch-none bg-white"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    style={{ touchAction: "none" }}
                  />
                  
                  {/* Text input overlay */}
                  <div
                    className="absolute inset-0 p-4 text-lg text-gray-700 bg-transparent border-none outline-none resize-none cursor-text"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setUserAnswer(e.currentTarget.textContent || "")}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        // For writing exercises, don't auto-submit on Enter
                      }
                    }}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      lineHeight: '1.5',
                      minHeight: '300px',
                      pointerEvents: 'auto'
                    }}
                    data-placeholder="Écris ton histoire ici ou dessine avec le crayon..."
                    aria-label="Zone d'écriture - écris ou dessine ici"
                  />
                </div>

                <div className="flex justify-between items-center mt-3 p-2 bg-gray-50 rounded text-sm">
                  <span>
                    📏 Pression: <strong>{Math.round(pencilPressure * 100)}%</strong>
                  </span>
                  <span>
                    📐 Inclinaison: <strong>{Math.round(pencilTilt)}°</strong>
                  </span>
                  <span>{isErasing ? "🧽 Gomme" : "✏️ Écriture"}</span>
                </div>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg">
                <p className="text-center text-gray-800">
                  <strong>Conseil :</strong> Essaie d'utiliser tous les mots dans ton histoire pour créer une aventure avec {themes[selectedTheme as keyof typeof themes].name} !
                </p>
              </div>

              <Button
                onClick={() => {
                  alert("Bravo ! Tu as créé une belle histoire !")
                  setExerciseType(null)
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-3"
              >
                Terminer mon histoire
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
