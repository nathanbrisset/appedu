# 🤖 AI Story Generation Setup

## OpenAI Integration

This educational app now includes AI-powered story generation using OpenAI's GPT-3.5-turbo model. Here's how to set it up:

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the API key (it starts with `sk-`)

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory of your project:

```bash
# OpenAI API Key for AI Story Generation
OPENAI_API_KEY=sk-your_actual_api_key_here

# Optional: Set to 'true' to enable AI features by default
NEXT_PUBLIC_ENABLE_AI=true
```

### 3. Features Available

With AI integration, the app can now:

- **Generate Dynamic Stories**: Create unique stories for each language and theme
- **Adaptive Difficulty**: Stories adjust to beginner, intermediate, and advanced levels
- **Multiple Languages**: Support for Catalan, French, Spanish, and English
- **Theme-Based Content**: Stories tailored to popular kids' themes (Sonic, Pokémon, Minecraft, etc.)

### 4. How It Works

1. **Listening Exercises**: AI generates short stories with comprehension questions
2. **Reading Exercises**: AI creates longer stories with multiple questions
3. **Writing Exercises**: AI provides vocabulary words and creative prompts

### 5. Fallback System

If the AI service is unavailable or the API key is not configured:
- The app falls back to predefined stories
- All functionality remains intact
- Users can still complete all exercises

### 6. Cost Considerations

- OpenAI charges per API call (approximately $0.002 per 1K tokens)
- Each story generation uses about 200-500 tokens
- Estimated cost: ~$0.001-0.002 per story

### 7. Privacy & Security

- API calls are made server-side
- No user data is sent to OpenAI
- Stories are generated in real-time and not stored

### 8. Troubleshooting

If AI generation isn't working:

1. Check that your API key is correct
2. Ensure the `.env.local` file is in the root directory
3. Restart the development server after adding the API key
4. Check the browser console for error messages

### 9. Example Usage

Once configured, users will see:
- A "✨ Nouvelle histoire" button in listening exercises
- AI-generated content marked with a sparkle icon
- Option to switch between AI and classic stories

The AI integration makes the educational content more engaging and provides unlimited variety for kids learning languages! 🎉 