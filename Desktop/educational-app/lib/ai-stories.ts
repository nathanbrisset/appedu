export interface AIStoryRequest {
  language: string
  theme: string
  exerciseType: 'listening' | 'reading' | 'writing'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface AIListeningStory {
  text: string
  question: string
  answer: string
}

export interface AIReadingStory {
  title: string
  text: string
  questions: Array<{
    question: string
    answer: string
  }>
}

export interface AIWritingExercise {
  words: string[]
  prompt: string
}

export async function generateAIStory(request: AIStoryRequest): Promise<AIListeningStory | AIReadingStory | AIWritingExercise> {
  try {
    // Use relative URL which works in both development and production
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: request.language,
        theme: request.theme,
        exerciseType: request.exerciseType,
        difficulty: request.difficulty || 'beginner'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to generate story')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error generating AI story:', error)
    throw error
  }
}

// Fallback content when AI is not available
export const fallbackContent = {
  listening: {
    text: "Il était une fois un héros qui aimait aider les autres. Un jour, il rencontra un ami qui avait besoin d'aide.",
    question: "Que faisait le héros?",
    answer: "il aidait les autres"
  },
  reading: {
    title: "Une Aventure Magique",
    text: "Dans un monde lointain, vivait un petit héros courageux. Il aimait explorer et découvrir de nouveaux endroits.",
    questions: [
      { question: "Où vivait le héros?", answer: "dans un monde lointain" },
      { question: "Que faisait-il?", answer: "il explorait" }
    ]
  },
  writing: {
    words: ["héros", "aventure", "magie", "ami", "courage"],
    prompt: "Raconte une histoire avec ces mots magiques!"
  }
} 