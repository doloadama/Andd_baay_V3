import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Language } from '../utils/i18n';

type LiveSessionPromise = ReturnType<GoogleGenAI['live']['connect']>;

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
  t: (key: any, options?: any) => string;
  lang: Language;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ t }) => {
    const [isConversing, setIsConversing] = useState(false);
    const [status, setStatus] = useState('idle');
    const [transcript, setTranscript] = useState<{ author: string, text: string }[]>([]);
    
    const sessionPromiseRef = useRef<LiveSessionPromise | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopConversation = () => {
        setIsConversing(false);
        setStatus('idle');
        
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);

        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    };

    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, []);

    const startConversation = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            setStatus(t('connecting'));
            setTranscript([]);
            nextStartTimeRef.current = 0;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus(t('listening'));
                        setIsConversing(true);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription?.text) {
                            setTranscript(prev => [...prev, { author: 'Model', text: message.serverContent.outputTranscription.text }]);
                        }
                        if (message.serverContent?.inputTranscription?.text) {
                            setTranscript(prev => [...prev, { author: 'You', text: message.serverContent.inputTranscription.text }]);
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const outputAudioContext = outputAudioContextRef.current;
                            const nextStartTime = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            
                            const audioSource = outputAudioContext.createBufferSource();
                            audioSource.buffer = audioBuffer;
                            audioSource.connect(outputAudioContext.destination);
                            
                            audioSource.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(audioSource);
                            });

                            audioSource.start(nextStartTime);
                            nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
                            audioSourcesRef.current.add(audioSource);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live API Error:', e);
                        setStatus('Error');
                        stopConversation();
                    },
                    onclose: (e: CloseEvent) => {
                        console.debug('closed', e);
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                },
            });
            sessionPromiseRef.current = sessionPromise;
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob: Blob = {
                    data: encode(new Uint8Array(new Int16Array(inputData.map(d => d * 32768)).buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                };
                sessionPromiseRef.current?.then(session => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);

        } catch (error) {
            console.error("Failed to start conversation:", error);
            setStatus('Mic permission denied');
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('navVoiceAssistant')}</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="mb-4 text-gray-700 dark:text-gray-300">{t('voiceAssistantDesc')}</p>
                <div className="flex items-center space-x-4 mb-4">
                     <button 
                        onClick={isConversing ? stopConversation : startConversation}
                        className={`px-6 py-3 font-semibold text-white rounded-lg shadow-md transition-colors ${isConversing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                     >
                        {isConversing ? t('stopConversation') : t('startConversation')}
                    </button>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Status: <span className="font-bold">{status}</span></p>
                </div>
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-700 rounded-md h-64 overflow-y-auto">
                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Transcript</h4>
                    {transcript.map((line, index) => (
                        <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                           <span className="font-bold">{line.author}:</span> {line.text}
                        </p>
                    ))}
                    {transcript.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Your conversation will appear here...</p>}
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistant;