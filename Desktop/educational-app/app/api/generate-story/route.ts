import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { language, theme, exerciseType, difficulty } = await request.json()

    // Validate required fields
    if (!language || !theme || !exerciseType) {
      return NextResponse.json(
        { error: 'Missing required fields: language, theme, exerciseType' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured in environment variables')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    console.log('Environment check:', {
      hasOpenAIKey: !!openaiApiKey,
      keyLength: openaiApiKey?.length,
      keyPrefix: openaiApiKey?.substring(0, 7),
      nodeEnv: process.env.NODE_ENV
    })

    // Language mapping for OpenAI
    const languageMap = {
      catalan: 'Catalan',
      french: 'French',
      spanish: 'Spanish',
      english: 'English'
    }

    // Theme mapping
    const themeMap = {
      captainUnderpants: 'Captain Underpants',
      hotWheels: 'Hot Wheels',
      sonic: 'Sonic the Hedgehog',
      ninjago: 'Ninjago',
      pokemon: 'Pokémon',
      minecraft: 'Minecraft'
    }

    // Exercise type mapping
    const exerciseTypeMap = {
      listening: 'listening comprehension',
      reading: 'reading comprehension',
      writing: 'creative writing'
    }

    // Difficulty mapping
    const difficultyMap = {
      beginner: 'simple vocabulary and short sentences',
      intermediate: 'moderate vocabulary and medium-length sentences',
      advanced: 'complex vocabulary and longer sentences'
    }

    // Create the prompt based on exercise type
    let prompt = ''
    let systemPrompt = ''

    if (exerciseType === 'listening') {
      systemPrompt = `You are a children's educational content creator. Create engaging, age-appropriate content in ${languageMap[language as keyof typeof languageMap]} for kids learning the language.`
      
      prompt = `Create a short story (50-80 words) in ${languageMap[language as keyof typeof languageMap]} about ${themeMap[theme as keyof typeof themeMap]} with ${difficultyMap[difficulty as keyof typeof difficultyMap]}. 

The story should be:
- Engaging and fun for children aged 6-12
- Educational and age-appropriate
- Include a simple question about the story content
- Use vocabulary suitable for ${difficulty} level

Format the response as JSON:
{
  "text": "the story text",
  "question": "a simple question about the story",
  "answer": "the expected answer"
}`
    } else if (exerciseType === 'reading') {
      systemPrompt = `You are a children's educational content creator. Create engaging, age-appropriate reading content in ${languageMap[language as keyof typeof languageMap]} for kids learning the language.`
      
      prompt = `Create a reading story in ${languageMap[language as keyof typeof languageMap]} about ${themeMap[theme as keyof typeof themeMap]} with ${difficultyMap[difficulty as keyof typeof difficultyMap]}.

The story should be:
- 100-150 words for ${difficulty} level
- Engaging and fun for children aged 6-12
- Include a title and 2-3 comprehension questions
- Use vocabulary suitable for ${difficulty} level

Format the response as JSON:
{
  "title": "story title",
  "text": "the story text",
  "questions": [
    {"question": "question 1", "answer": "answer 1"},
    {"question": "question 2", "answer": "answer 2"}
  ]
}`
    } else if (exerciseType === 'writing') {
      systemPrompt = `You are a children's educational content creator. Create engaging, age-appropriate writing prompts in ${languageMap[language as keyof typeof languageMap]} for kids learning the language.`
      
      prompt = `Create a creative writing exercise in ${languageMap[language as keyof typeof languageMap]} about ${themeMap[theme as keyof typeof themeMap]} with ${difficultyMap[difficulty as keyof typeof difficultyMap]}.

The exercise should include:
- 5-7 vocabulary words related to the theme
- A creative writing prompt
- Age-appropriate for children 6-12

Format the response as JSON:
{
  "words": ["word1", "word2", "word3", "word4", "word5"],
  "prompt": "creative writing prompt"
}`
    } else {
      console.error('Unrecognized exercise type:', exerciseType)
      return NextResponse.json(
        { error: `Unrecognized exercise type: ${exerciseType}` },
        { status: 400 }
      )
    }

    // Validate that we have a prompt
    if (!prompt || !systemPrompt) {
      console.error('No prompt generated for exercise type:', exerciseType)
      return NextResponse.json(
        { error: 'Failed to generate prompt for exercise type' },
        { status: 500 }
      )
    }

    console.log('Making OpenAI API call with:', {
      language,
      theme,
      exerciseType,
      difficulty,
      hasApiKey: !!openaiApiKey
    })

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    console.log('OpenAI API response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      return NextResponse.json(
        { error: `Failed to generate content from OpenAI: ${response.status} ${response.statusText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('OpenAI API response received:', {
      hasChoices: !!data.choices,
      choiceCount: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content
    })

    const generatedContent = data.choices[0]?.message?.content

    if (!generatedContent) {
      console.error('No content in OpenAI response:', data)
      return NextResponse.json(
        { error: 'No content generated from OpenAI' },
        { status: 500 }
      )
    }

    console.log('Generated content length:', generatedContent.length)

    // Parse the JSON response
    try {
      const parsedContent = JSON.parse(generatedContent)
      console.log('Successfully parsed JSON response')
      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', {
        error: parseError,
        content: generatedContent.substring(0, 200) + '...',
        contentLength: generatedContent.length
      })
      return NextResponse.json(
        { error: 'Invalid response format from OpenAI' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 