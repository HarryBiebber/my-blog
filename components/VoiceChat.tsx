import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { decode, decodeAudioData, createBlob } from '../utils/audioUtils';

const VoiceChat: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null); 

  const stopAudio = () => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Live Session Open");
            setConnected(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination); 
            
            sourceRef.current = source;
            processorRef.current = scriptProcessor;
          },
          onmessage: async (message: LiveServerMessage) => {
             if (message.serverContent?.interrupted) {
                stopAudio();
                setIsTalking(false);
                return;
             }
             
             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (base64Audio) {
               setIsTalking(true);
               const ctx = audioContextRef.current;
               if (!ctx) return;

               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 ctx,
                 24000,
                 1
               );

               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
                 if (sourcesRef.current.size === 0) setIsTalking(false);
               });

               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
             }
          },
          onclose: () => {
            setConnected(false);
          },
          onerror: (e) => {
            console.error(e);
            setConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "你是一个友好、知识渊博的博客助手。请用中文回答，保持简洁、有吸引力。",
        },
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      alert("需要麦克风权限。");
    }
  };

  const endSession = async () => {
    if (processorRef.current && inputAudioContextRef.current) {
        processorRef.current.disconnect();
        sourceRef.current?.disconnect();
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
    }
    stopAudio();
    
    if (sessionPromiseRef.current) {
        const session = await sessionPromiseRef.current;
        session.close();
    }
    
    setConnected(false);
    setIsTalking(false);
  };

  useEffect(() => {
    return () => {
        endSession();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className={`relative flex items-center justify-center transition-all duration-700 ${
          connected ? (isTalking ? 'w-48 h-48' : 'w-32 h-32') : 'w-24 h-24'
      }`}>
         {/* Minimalist Visualizer Circles */}
         <div className={`absolute inset-0 rounded-full border border-black opacity-20 ${isTalking ? 'animate-ping' : ''}`}></div>
         <div className={`absolute inset-4 rounded-full border border-black opacity-40 ${isTalking ? 'animate-ping animation-delay-150' : ''}`}></div>
         
         <div className={`relative z-10 w-full h-full bg-black rounded-full flex items-center justify-center transition-all`}>
            {connected ? (
                <div className="space-x-1 flex items-center h-8">
                     {/* Audio bars simulation */}
                     <div className={`w-1 bg-white rounded-full ${isTalking ? 'h-8 animate-bounce' : 'h-2'}`}></div>
                     <div className={`w-1 bg-white rounded-full ${isTalking ? 'h-12 animate-bounce animation-delay-75' : 'h-2'}`}></div>
                     <div className={`w-1 bg-white rounded-full ${isTalking ? 'h-6 animate-bounce animation-delay-150' : 'h-2'}`}></div>
                </div>
            ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            )}
         </div>
      </div>

      <div className="mt-12 space-y-4 max-w-lg">
        <h2 className="text-4xl font-black uppercase tracking-tight">
          {connected ? "正在聆听" : "开启对话"}
        </h2>
        <p className="text-gray-500 font-medium">
          {connected 
            ? "请自然交谈。我在听。" 
            : "连接到 Gemini Live API，体验流畅的实时语音交互。"}
        </p>
      </div>

      <div className="mt-10">
        {!connected ? (
            <button
            onClick={startSession}
            className="bg-black text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 hover:scale-105 transition-all"
            >
            连接语音
            </button>
        ) : (
            <button
            onClick={endSession}
            className="bg-gray-200 text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-300 transition-colors"
            >
            结束会话
            </button>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;