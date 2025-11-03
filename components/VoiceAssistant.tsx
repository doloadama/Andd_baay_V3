import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { t, Language } from '../utils/i18n';

// Since LiveSession is not an exported type, we infer it or use a simplified interface.
// For this context, we will manage the session promise.
type LiveSessionPromise = ReturnType<GoogleGenAI['live']['connect']>;
type LiveSession = Awaited<LiveSessionPromise>;

// Audio helper functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface VoiceAssistantProps {
  t: (key: any, lang: Language) => string;
  lang: Language;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ t, lang }) => {
    const [isConversing, setIsConversing] = useState(false);
    const [status, setStatus] = useState('idle');
    const [transcript, setTranscript] = useState<string[]>([]);
    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    
    useEffect(() => {
        // Cleanup on unmount
        return () => {
            sessionRef.current?.close();
        };
    }, []);

    const startConversation = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            setStatus(t('connecting', lang));

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus(t('listening', lang));
                        setIsConversing(true);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (message.serverContent?.outputTranscription) {
                            setTranscript(prev => [...prev, `Model: ${message.serverContent.outputTranscription.text}`]);
                        } else if (message.serverContent?.inputTranscription) {
                            setTranscript(prev => [...prev, `You: ${message.serverContent.inputTranscription.text}`]);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live API Error:', e);
                        setStatus('Error');
                        stopConversation();
                    },
                    onclose: () => {
                         setStatus('Idle');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                },
            });
            
            sessionRef.current = await sessionPromise;
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    int16[i] = inputData[i] * 32768;
                }
                const pcmBlob: Blob = {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                };
                sessionRef.current?.sendRealtimeInput({ media: pcmBlob });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);

        } catch (error) {
            console.error("Failed to start conversation:", error);
            setStatus('Mic permission denied');
        }
    };
    
    const stopConversation = () => {
        sessionRef.current?.close();
        sessionRef.current = null;
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        audioContextRef.current?.close();

        setIsConversing(false);
        setStatus('idle');
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('navVoiceAssistant', lang)}</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="mb-4 text-gray-700 dark:text-gray-300">{t('voiceAssistantDesc', lang)}</p>
                <div className="flex items-center space-x-4">
                     <button 
                        onClick={isConversing ? stopConversation : startConversation}
                        className={`px-6 py-3 font-semibold text-white rounded-lg shadow-md transition-colors ${isConversing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                     >
                        {isConversing ? t('stopConversation', lang) : t('startConversation', lang)}
                    </button>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Status: {status}</p>
                </div>
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-md h-64 overflow-y-auto">
                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Transcript</h4>
                    {transcript.map((line, index) => <p key={index} className="text-sm text-gray-700 dark:text-gray-300">{line}</p>)}
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistant;