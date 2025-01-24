'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Play, X, User, Bot } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { transcribeAudio, generateResponse, textToSpeech } from '@/lib/openai';
import { formatTime, validateAudio } from '@/lib/utils';
import type { ChatState } from '@/types/chat';

export default function VoiceChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isProcessing: false,
    error: null,
  });

  const { isRecording, duration, error: recordingError, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatState.messages]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      setChatState(prev => ({ ...prev, error: 'Failed to start recording' }));
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      if (!validateAudio(audioBlob)) {
        throw new Error('Invalid audio recording');
      }

      const messageId = Date.now().toString();

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: messageId,
          content: '',
          type: 'user',
          timestamp: Date.now(),
          status: 'processing'
        }],
        isProcessing: true
      }));

      const transcription = await transcribeAudio(audioBlob);
      
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: transcription, status: 'complete' }
            : msg
        )
      }));

      const aiResponse = await generateResponse(transcription);
      const aiMessageId = Date.now().toString();

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: aiMessageId,
          content: aiResponse,
          type: 'assistant',
          timestamp: Date.now(),
          status: 'processing'
        }]
      }));

      const audioResponse = await textToSpeech(aiResponse);
      const audioUrl = URL.createObjectURL(new Blob([audioResponse], { type: 'audio/mp3' }));

      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, status: 'complete', audioUrl }
            : msg
        ),
        isProcessing: false
      }));

      const audio = new Audio(audioUrl);
      setIsPlaying(aiMessageId);
      await audio.play();
      audio.onended = () => setIsPlaying(null);

    } catch (error) {
      setChatState(prev => ({
        ...prev,
        error: 'Failed to process audio',
        isProcessing: false
      }));
    }
  };

  const playAudio = async (messageId: string, audioUrl: string) => {
    if (isPlaying) {
      return; // Prevent multiple audio playbacks
    }
    const audio = new Audio(audioUrl);
    setIsPlaying(messageId);
    await audio.play();
    audio.onended = () => setIsPlaying(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <h2 className="text-white text-lg font-semibold">Voice Chat Assistant</h2>
      </div>

      <div
        ref={chatContainerRef}
        className="h-[500px] overflow-y-auto p-6 space-y-6 bg-gray-50"
      >
        {chatState.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-12 h-12 mb-4 text-blue-500" />
            <p className="text-center">Start a conversation by clicking the microphone button below</p>
          </div>
        )}

        {chatState.messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`flex items-end gap-2 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-700" />
                )}
              </div>

              <div
                className={`rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                }`}
              >
                <p className="mb-2 leading-relaxed">
                  {message.content || (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  )}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className={`opacity-75 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  {message.audioUrl && (
                    <button
                      onClick={() => playAudio(message.id, message.audioUrl!)}
                      disabled={isPlaying !== null}
                      className={`ml-2 p-2 rounded-full transition-colors ${
                        message.type === 'user'
                          ? 'hover:bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      } ${isPlaying === message.id ? 'animate-pulse' : ''}`}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t bg-white p-4">
        {chatState.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 flex items-center gap-2">
            <X className="w-5 h-5" />
            <p>{chatState.error}</p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={chatState.isProcessing}
              className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl active:scale-95 transform"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <>
              <button
                onClick={cancelRecording}
                className="bg-gray-500 text-white p-4 rounded-full hover:bg-gray-600 transition-colors shadow-lg hover:shadow-xl active:scale-95 transform"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                {formatTime(duration)}
              </div>
              <button
                onClick={handleStopRecording}
                className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl active:scale-95 transform"
              >
                <Square className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}