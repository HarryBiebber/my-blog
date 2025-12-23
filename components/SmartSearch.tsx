import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'maps'>('search');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [chunks, setChunks] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    setChunks([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (mode === 'search') {
        const result = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: query,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        setResponse(result.text || "暂无回答。");
        setChunks(result.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
      } else {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const result = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: query,
              config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                  retrievalConfig: {
                    latLng: {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                    }
                  }
                }
              },
            });
            setResponse(result.text || "暂无回答。");
            setChunks(result.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
            setLoading(false);
          } catch (err) {
            console.error(err);
            setResponse("连接地图服务失败，请重试。");
            setLoading(false);
          }
        }, (err) => {
           setResponse("地图查询需要获取您的位置权限。");
           setLoading(false);
        });
        return; 
      }

    } catch (error) {
      console.error(error);
      setResponse("发生错误，请检查网络连接。");
    } finally {
      if (mode !== 'maps') setLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-16">
      <div className="mb-12 text-center">
         <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
             AI 智能探索
         </h1>
         <p className="text-gray-500 font-medium">利用 Google 的力量寻找答案或探索周边。</p>
      </div>

      {/* Mode Toggles - Pill Shaped */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setMode('search')}
          className={`px-8 py-3 rounded-full font-bold text-sm transition-all border ${
            mode === 'search' 
              ? 'bg-black text-white border-black' 
              : 'bg-white text-gray-500 border-gray-300 hover:border-black'
          }`}
        >
          Google 搜索
        </button>
        <button
          onClick={() => setMode('maps')}
          className={`px-8 py-3 rounded-full font-bold text-sm transition-all border ${
            mode === 'maps' 
              ? 'bg-black text-white border-black' 
              : 'bg-white text-gray-500 border-gray-300 hover:border-black'
          }`}
        >
          Google 地图
        </button>
      </div>

      {/* Search Input - Big & Bold */}
      <div className="relative mb-16">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === 'search' ? "2024年奥运会金牌榜..." : "附近的意大利餐厅..."}
          className="w-full p-6 text-xl md:text-2xl font-bold rounded-2xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-black focus:outline-none transition-all placeholder-gray-400"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-3 rounded-full hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {loading ? (
             <span className="block w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
        </button>
      </div>

      {/* Results Area */}
      {response && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">AI 回答</h3>
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-800">
               <p className="whitespace-pre-wrap leading-relaxed">{response}</p>
            </div>
          </div>
          
          <div className="lg:col-span-1 border-l border-gray-100 pl-8 hidden lg:block">
            {chunks.length > 0 && (
              <div>
                <h4 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">来源索引</h4>
                <div className="space-y-3">
                   {chunks.map((chunk, idx) => {
                     const webUri = chunk.web?.uri;
                     const webTitle = chunk.web?.title;
                     const mapUri = chunk.maps?.uri;
                     const mapTitle = chunk.maps?.title;

                     if (webUri && webTitle) {
                       return (
                         <a key={idx} href={webUri} target="_blank" rel="noopener noreferrer" className="block group">
                           <p className="text-sm font-bold text-black group-hover:underline leading-tight mb-1">{webTitle}</p>
                           <p className="text-xs text-gray-400 truncate">{new URL(webUri).hostname}</p>
                         </a>
                       )
                     }
                     if (mapUri && mapTitle) {
                        return (
                          <a key={idx} href={mapUri} target="_blank" rel="noopener noreferrer" className="block group flex items-start">
                            <span className="mr-2 text-red-600 mt-0.5">📍</span>
                            <div>
                                <p className="text-sm font-bold text-black group-hover:underline leading-tight">{mapTitle}</p>
                                <p className="text-xs text-gray-400">Google Maps</p>
                            </div>
                          </a>
                        )
                     }
                     return null;
                   })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;