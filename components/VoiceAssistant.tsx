import React, { useState, useRef, useEffect, useCallback } from 'react';
// Fix: Removed unused 'GoogleGenAI' and non-exported 'LiveSession' types.
import { LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, Bot, Loader, User } from 'lucide-react';
import { ai } from '../services/geminiService';

// Helper functions from Gemini documentation
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface TranscriptEntry {
    source: 'user' | 'model';
    text: string;
}


const VoiceAssistant: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState('Idle. Press the microphone to start.');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    
    const sessionPromiseRef = useRef<ReturnType<typeof ai.live.connect> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const stopAudioProcessing = useCallback(() => {
        if (mediaStreamSourceRef.current && scriptProcessorRef.current && inputAudioContextRef.current) {
            mediaStreamSourceRef.current.disconnect(scriptProcessorRef.current);
            scriptProcessorRef.current.disconnect(inputAudioContextRef.current.destination);
        }
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
    }, []);

    const stopConversation = useCallback(() => {
        setIsListening(false);
        setStatus('Conversation ended. Press microphone to start again.');
        
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }

        stopAudioProcessing();

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
             sourcesRef.current.forEach(source => source.stop());
             sourcesRef.current.clear();
             outputAudioContextRef.current.close();
        }
    }, [stopAudioProcessing]);


    const startConversation = async () => {
        if (isListening || isConnecting) {
           stopConversation();
           return;
        }

        setIsConnecting(true);
        setStatus('Connecting to assistant...');
        setTranscript([]);
        nextStartTimeRef.current = 0;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const outputAudioCtx = outputAudioContextRef.current;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setIsListening(true);
                        setStatus('Connected. Speak now.');
                        const inputAudioCtx = inputAudioContextRef.current!;
                        const source = inputAudioCtx.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) { int16[i] = inputData[i] * 32768; }
                            const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                            sessionPromiseRef.current!.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioCtx.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.source === 'user') {
                                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                                }
                                return [...prev, { source: 'user', text }];
                            });
                         }
                         if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.source === 'model') {
                                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                                }
                                return [...prev, { source: 'model', text }];
                            });
                         }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioCtx, 24000, 1);
                            const source = outputAudioCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioCtx.destination);
                            
                            sourcesRef.current.add(source);
                            source.onended = () => sourcesRef.current.delete(source);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(source => source.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Gemini Live API Error:', e);
                        setStatus(`Error: ${e.message}. Please try again.`);
                        stopConversation();
                    },
                    onclose: () => {
                       if (isListening) stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });
            await sessionPromiseRef.current;

        } catch (error) {
            console.error('Error starting voice assistant:', error);
            setStatus('Failed to start. Please check microphone permissions.');
            setIsConnecting(false);
            stopConversation();
        }
    };
    
    useEffect(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);
    
    useEffect(() => () => stopConversation(), [stopConversation]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Voice Assistant</h2>
            <p className="text-gray-600 max-w-2xl">
                Ask me anything about your farm, projects, or the market. For example: "What are my active projects?" or "What's the market price for mangoes?"
            </p>
            
            <div className="relative">
                <button
                    onClick={startConversation}
                    disabled={isConnecting}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl
                        ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'}
                        ${isConnecting ? 'bg-gray-400 cursor-not-allowed shadow-none' : ''}
                    `}
                >
                    {isConnecting ? <Loader className="animate-spin" size={40}/> : isListening ? <MicOff size={40} /> : <Mic size={40} />}
                </button>
                 {isListening && <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-pulse pointer-events-none"></div>}
            </div>
            <p className="font-semibold text-lg h-6 transition-colors">{status}</p>

            <div className="w-full bg-stone-50 rounded-lg p-4 border border-stone-200 max-h-96 overflow-y-auto">
                <div className="space-y-4 text-left">
                    {transcript.map((entry, index) => (
                        <div key={index} className={`flex items-start gap-3 ${entry.source === 'user' ? 'justify-end' : ''}`}>
                            {entry.source === 'model' && <div className="bg-emerald-100 p-2 rounded-full"><Bot size={16} className="text-emerald-700"/></div>}
                             <div className={`px-4 py-2 rounded-lg max-w-md ${entry.source === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-stone-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="text-sm">{entry.text}</p>
                            </div>
                            {entry.source === 'user' && <div className="bg-blue-100 p-2 rounded-full"><User size={16} className="text-blue-700"/></div>}
                        </div>
                    ))}
                    {transcript.length === 0 && <p className="text-center text-gray-500 py-16">Transcript will appear here...</p>}
                    <div ref={transcriptEndRef} />
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistant;