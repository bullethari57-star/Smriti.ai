import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  Brain, 
  ShieldAlert, 
  HelpCircle,
  StopCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../components/chat/ChatMessage';
import { VoiceControls, VoiceStatusBanner } from '../components/chat/VoiceControls';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { sendChatMessage } from '../services/geminiService';

export function ChatPage() {
  const { 
    chatMessages, 
    setChatMessages, 
    memories, 
    reminders, 
    settings 
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Speech Recognition Hook
  const {
    isSupported: isSpeechRecSupported,
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition({
    onTranscript: (liveText) => {
      // Allow user to see and edit real-time recognized text directly in input
      setInput(liveText);
    }
  });

  // Speech Synthesis Hook
  const {
    isSupported: isSpeechSynthSupported,
    isSpeaking,
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  // Handle Speech playback
  const handleSpeak = (text, messageId) => {
    setCurrentlySpeakingId(messageId);
    speak(text);
  };

  const handleStopSpeak = () => {
    stopSpeaking();
    setCurrentlySpeakingId(null);
  };

  useEffect(() => {
    if (!isSpeaking) {
      setCurrentlySpeakingId(null);
    }
  }, [isSpeaking]);

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    // Clear input and speech state
    setInput('');
    clearTranscript();
    setApiError(null);

    // Append user message
    const userMsgId = `user-${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...chatMessages, userMessage];
    setChatMessages(newHistory);
    setIsLoading(true);

    try {
      // Build history payload for Gemini
      const historyPayload = chatMessages
        .filter(m => m.id !== 'welcome-msg')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content,
        }));

      const response = await sendChatMessage({
        message: messageText,
        history: historyPayload,
        memories,
        reminders,
        currentDateTime: new Date().toISOString(),
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      });

      const assistantMsgId = `ai-${Date.now()}`;
      const assistantMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: response.reply,
        action: response.action,
        timestamp: new Date().toISOString(),
      };

      setChatMessages([...newHistory, assistantMessage]);

      // If user enabled automatic voice response in settings, read aloud
      if (settings.voiceResponse && response.reply) {
        handleSpeak(response.reply, assistantMsgId);
      }

    } catch (err) {
      console.error('Chat error:', err);
      setApiError(err.message || 'Failed to get response from Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    handleStopSpeak();
    setChatMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: "Chat session restarted. I have your current saved memories and reminders ready. How can I help you?",
        timestamp: new Date().toISOString(),
        action: null,
      }
    ]);
    setApiError(null);
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...chatMessages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const sampleQuestions = [
    "When is Rahul's birthday?",
    "Remind me two days before Rahul's birthday",
    "What are Professor Sharma's office hours?",
    "Remember that Suresh's favorite book is Dune",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {/* Chat Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-soft mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-glow">
            <Brain className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
              Smriti AI Assistant
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                AI Assistant
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Grounded in {memories.length} saved memories & {reminders.length} reminders
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSpeaking && (
            <button
              onClick={handleStopSpeak}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop Audio</span>
            </button>
          )}

          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-3 py-2 space-y-2">
        {chatMessages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onSpeak={isSpeechSynthSupported ? handleSpeak : null}
            onStopSpeak={handleStopSpeak}
            isSpeaking={isSpeaking}
            currentlySpeakingId={currentlySpeakingId}
          />
        ))}

        {/* Loading Spinner State */}
        {isLoading && (
          <div className="flex items-start space-x-3 mb-4 animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
              <Brain className="w-4 h-4 text-accent-blue animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Smriti AI is thinking and searching memories...
              </span>
            </div>
          </div>
        )}

        {/* Simple API Error Display */}
        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm mb-4 animate-in fade-in flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-900">{apiError}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleRetryLast}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setApiError(null)}
                className="text-[11px] text-rose-700 hover:text-rose-900 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Suggested Prompt Chips (when few messages) */}
        {chatMessages.length <= 2 && !isLoading && (
          <div className="pt-2 pb-4">
            <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              Suggested questions to try:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="p-2.5 text-left text-xs text-slate-700 bg-white hover:bg-violet-50/70 border border-slate-200 hover:border-violet-300 rounded-xl transition-all shadow-sm group"
                >
                  <span className="font-medium group-hover:text-violet-700">"{q}"</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Indicator Banner */}
      <VoiceStatusBanner
        isListening={isListening}
        error={speechError}
        onDismissError={clearTranscript}
      />

      {/* Input Composer */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-soft mt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          {/* Voice input button */}
          <VoiceControls
            isSupported={isSpeechRecSupported}
            isListening={isListening}
            error={speechError}
            onStartListening={startListening}
            onStopListening={stopListening}
          />

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? "Listening... speak now or type here"
                : "Ask Smriti a question or ask to remember something..."
            }
            className="flex-1 px-3 py-2 text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-40 shadow-soft transition-all active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-slate-400">
          <span>Personal memories are used as private context. Responses require confirmation before saving.</span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
