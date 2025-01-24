# Voice-to-Voice Chat Application

This Next.js application demonstrates a voice-to-voice chat feature implemented using OpenAI's Text-to-Voice and Voice-to-Text API. The application allows users to record their voice, convert it to text, process the text, and then convert the AI response back to speech.

## Features

- Voice recording functionality
- Text-to-speech and speech-to-text conversion using OpenAI API
- Simple chat interface with message history
- Error handling and loading states
- TypeScript support

## Getting Started

1. Clone this repository:

   ```
   git clone https://github.com/MehdiiRezakhani/voice-to-voice-chat.git
   cd voice-to-voice-chat
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env.local` file and add your environment variables:

   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key

   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser.

## Usage

1. Click the microphone button to start recording.
2. Speak into your microphone when prompted.
3. The recorded audio will be converted to text and sent to an AI model (not provided by OpenAI).
4. The AI response will be converted back to speech and played through your speakers.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- OpenAI for providing the Text-to-Voice and Voice-to-Text APIs

## Troubleshooting

- If you encounter audio playback issues, ensure your browser allows autoplay.
- For Safari users, you may need to adjust autoplay settings in your browser.
