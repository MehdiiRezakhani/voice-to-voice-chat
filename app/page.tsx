import VoiceChat from '@/components/voice-chat';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Voice Chat</h1>
        <VoiceChat />
        <p className='text-xl font-bold text-center my-8'>Developed By <a href='https://www.linkedin.com/in/mehdiirezakhani/' target='_blank'>Mehdi Rezakhani</a></p>
      </div>
    </main>
  );
}