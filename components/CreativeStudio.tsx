import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from '../utils/audioUtils';
import { ImageSize } from '../types';

const CreativeStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'generate' | 'video'>('edit');

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-0">创意工坊</h1>
        <div className="flex space-x-2">
          {(['edit', 'generate', 'video'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition-all ${
                activeTab === tab 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {tab === 'edit' ? '智能修图' : tab === 'generate' ? '创意生图' : 'Veo 视频'}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-[600px]">
        {activeTab === 'edit' && <ImageEditor />}
        {activeTab === 'generate' && <ImageGenerator />}
        {activeTab === 'video' && <VideoGenerator />}
      </div>
    </div>
  );
};

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    try {
      const base64 = await fileToBase64(image);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType: image.type,
              },
            },
            { text: prompt },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert('编辑失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
      <div className="space-y-6">
        <div>
           <label className="block text-sm font-bold uppercase mb-2">1. 上传图片</label>
           <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-black transition-colors min-h-[300px] flex flex-col items-center justify-center bg-gray-50">
            {preview ? (
              <img src={preview} alt="Upload" className="max-h-64 object-contain" />
            ) : (
              <div className="text-gray-400">
                  <span className="text-2xl block mb-2">+</span>
                  <span className="text-sm font-bold">点击选择图片</span>
              </div>
            )}
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer"/>
          </div>
        </div>
        
        <div>
            <label className="block text-sm font-bold uppercase mb-2">2. 编辑指令</label>
            <div className="flex space-x-2">
                <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：'把背景换成雪山' 或 '添加复古滤镜'"
                className="flex-1 p-4 bg-gray-100 border-none rounded-lg font-medium focus:ring-2 focus:ring-black focus:outline-none"
                />
                <button
                onClick={handleEdit}
                disabled={loading || !image || !prompt}
                className="bg-black text-white px-8 rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                {loading ? '处理中...' : '应用'}
                </button>
            </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px]">
           {resultImage ? (
             <div className="w-full h-full p-4">
                 <img src={resultImage} alt="Result" className="w-full h-full object-contain rounded shadow-lg" />
                 <a href={resultImage} download="edited.png" className="block mt-4 text-center font-bold text-sm underline">下载图片</a>
             </div>
           ) : (
             <div className="text-gray-400 font-bold uppercase tracking-wider">效果预览</div>
           )}
      </div>
    </div>
  );
};

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.Size1K);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  const checkKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKey(true);
        return false;
      }
      setNeedsKey(false);
      return true;
    }
    return true; 
  };

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setNeedsKey(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResultImage(null);

    const hasKey = await checkKey();
    if (!hasKey) {
       setLoading(false);
       return; 
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            imageSize: size,
            aspectRatio: "1:1"
          }
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      } else {
        alert('生成失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      
      {needsKey && (
         <div className="bg-black text-white p-6 mb-8 rounded-lg flex justify-between items-center">
           <div>
             <p className="font-bold">需要选择付费 API 密钥</p>
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white underline">查看计费文档</a>
           </div>
           <button onClick={handleSelectKey} className="bg-white text-black px-4 py-2 rounded font-bold text-sm">选择密钥</button>
         </div>
      )}

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">描述你的想象</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-6 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-black h-40 resize-none text-lg font-medium"
            placeholder="一只穿着太空服的猫在霓虹灯闪烁的城市滑板..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase mb-2">画质选择</label>
          <div className="grid grid-cols-3 gap-4">
            {Object.values(ImageSize).map((s) => (
              <label key={s} className={`cursor-pointer py-3 text-center rounded-lg border-2 font-bold transition-all ${size === s ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                <input type="radio" value={s} checked={size === s} onChange={() => setSize(s)} className="hidden" />
                {s}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all"
        >
          {loading ? '正在生成...' : '立即生成'}
        </button>

        {resultImage && (
          <div className="mt-12 bg-gray-100 p-4 rounded-xl">
            <img src={resultImage} alt="Generated" className="w-full rounded shadow-xl" />
            <a href={resultImage} download="generated.png" className="block text-center mt-4 bg-white border border-gray-200 py-3 rounded-full font-bold text-sm hover:border-black transition-colors">下载高清原图</a>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoGenerator: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [needsKey, setNeedsKey] = useState(false);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setNeedsKey(false);
    }
  };

  const checkKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKey(true);
        return false;
      }
      setNeedsKey(false);
      return true;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!image) return;
    const hasKey = await checkKey();
    if (!hasKey) return;

    setLoading(true);
    setStatus('正在初始化...');
    setVideoUrl(null);

    try {
      const base64 = await fileToBase64(image);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this image naturally',
        image: {
          imageBytes: base64,
          mimeType: image.type,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9' 
        }
      });

      setStatus('Veo 正在渲染视频，请稍候...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); 
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await res.blob();
        setVideoUrl(URL.createObjectURL(blob));
      } else {
        setStatus('获取视频链接失败。');
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      }
      setStatus('视频生成出错。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
       <div className="space-y-8">
           <div>
               <h3 className="text-xl font-bold uppercase mb-4">Veo 视频生成</h3>
               <p className="text-gray-500 mb-6">上传一张静态图片，使用 Veo 模型将其转化为动态视频。</p>
                {needsKey && (
                    <div className="bg-black text-white p-4 rounded mb-6 text-sm flex justify-between items-center">
                        <span>Veo 需要付费 API 密钥</span>
                        <button onClick={handleSelectKey} className="underline font-bold">选择密钥</button>
                    </div>
                )}
           </div>

           <div className="space-y-4">
                <input 
                    type="file" 
                    onChange={(e) => setImage(e.target.files?.[0] || null)} 
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-gray-800"
                />
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="输入动画提示词 (可选)"
                    className="w-full p-4 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-black"
                />
                
                <button
                    onClick={handleGenerate}
                    disabled={loading || !image}
                    className="w-full py-4 bg-black text-white rounded-lg font-bold shadow-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? '渲染中...' : '生成视频'}
                </button>
                {loading && <p className="text-sm text-black font-medium animate-pulse">{status}</p>}
           </div>
       </div>

       <div className="bg-black rounded-xl flex items-center justify-center min-h-[300px] overflow-hidden">
           {videoUrl ? (
             <video controls src={videoUrl} className="w-full h-full object-contain" />
           ) : (
             <div className="text-gray-500 font-bold uppercase tracking-wider">视频预览区域</div>
           )}
        </div>
    </div>
  );
};

export default CreativeStudio;