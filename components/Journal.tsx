import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { campusAlbums, adventureAlbums } from '../data/mockData';
import { Album, KnowledgeItem } from '../types';

// ============================================================================
// 👇👇👇 个人介绍视频 & 封面 👇👇👇
const MY_INTRO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
// 视频未播放时显示的封面图
const MY_INTRO_POSTER = "https://picsum.photos/seed/intro_poster/1920/1080"; 

// 👇👇👇 首页背景循环视频 (静音) 👇👇👇
const HERO_BG_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
// ============================================================================

// Helper type for the unified feed
type FeedItem = 
  | { type: 'campus'; data: Album }
  | { type: 'adventure'; data: Album }
  | { type: 'knowledge'; data: KnowledgeItem };

const Journal: React.FC = () => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  
  // Lightbox State
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Load and merge data
  useEffect(() => {
    // 1. Campus
    // Note: In real app, load from LocalStorage if you want dynamic adds here too
    const campusItems: FeedItem[] = campusAlbums.map(a => ({ type: 'campus', data: a }));
    // 2. Adventure
    const adventureItems: FeedItem[] = adventureAlbums.map(a => ({ type: 'adventure', data: a }));
    // 3. Knowledge
    const savedKnowledge = localStorage.getItem('knowledge_items');
    let knowledgeItems: FeedItem[] = [];
    if (savedKnowledge) {
        knowledgeItems = (JSON.parse(savedKnowledge) as KnowledgeItem[]).map(k => ({ type: 'knowledge', data: k }));
    } else {
        knowledgeItems = [
            { type: 'knowledge', data: { id: 'k1', title: 'React Hooks 深度解析', content: 'UseEffect 的依赖数组陷阱...', date: '2023.10.01', category: '科技', tags: ['Tech'], likes: 12 } }
        ];
    }

    // Merge and Sort by Date (Descending)
    const allItems = [...campusItems, ...adventureItems, ...knowledgeItems].sort((a, b) => {
        return a.data.date > b.data.date ? -1 : 1;
    });

    setFeed(allItems);
  }, []);

  const handlePlayVideo = () => {
      setIsVideoPlaying(true);
      if (videoRef.current) {
          videoRef.current.play();
      }
  };

  const closeVideoModal = () => {
      setShowVideo(false);
      setIsVideoPlaying(false);
  }

  // -- DETAIL VIEW SUB-COMPONENT --
  if (selectedItem) {
    const { data, type } = selectedItem;
    
    // Knowledge Detail View
    if (type === 'knowledge') {
        const kData = data as KnowledgeItem;
        return (
             <div className="max-w-[1000px] mx-auto px-6 py-12 animate-fade-in">
                {lightboxImg && (
                    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
                        <img src={lightboxImg} alt="Zoomed" className="max-w-full max-h-full object-contain cursor-zoom-out" />
                    </div>
                )}
                
                <button onClick={() => setSelectedItem(null)} className="mb-8 flex items-center font-bold text-gray-500 hover:text-black">
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                     返回最新动态
                </button>
                <div className="bg-gray-50 p-12 border-l-8 border-black rounded-3xl shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-bold text-white bg-black px-3 py-1 mb-2 inline-block rounded-full">{kData.category}</span>
                            <h1 className="text-4xl font-black">{kData.title}</h1>
                        </div>
                        <span className="bg-white px-3 py-1 font-bold text-sm border rounded-lg">{kData.date}</span>
                    </div>
                    {kData.imageUrl && (
                        <img 
                            src={kData.imageUrl} 
                            alt={kData.title} 
                            onClick={() => setLightboxImg(kData.imageUrl || null)}
                            className="w-full max-h-[500px] object-cover mb-8 rounded-2xl cursor-zoom-in hover:opacity-95 transition-opacity" 
                        />
                    )}
                    <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-loose">
                        {kData.content}
                    </div>
                </div>
             </div>
        )
    }

    // Album Detail View
    const albumData = data as Album;
    return (
      <div className="w-full min-h-screen bg-white animate-fade-in">
        {lightboxImg && (
            <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
                <img src={lightboxImg} alt="Zoomed" className="max-w-full max-h-full object-contain cursor-zoom-out" />
            </div>
        )}

        <div className="max-w-[1440px] mx-auto px-6 py-12">
            <button 
                onClick={() => setSelectedItem(null)}
                className="flex items-center text-sm font-bold uppercase tracking-wide mb-8 hover:text-gray-500"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                返回最新动态
            </button>

            <div className="mb-12">
                <div className="flex items-center space-x-3 text-gray-500 font-bold uppercase text-xs mb-2">
                    <span className={`px-2 py-1 text-white rounded-md ${type === 'campus' ? 'bg-blue-600' : 'bg-black'}`}>
                        {type === 'campus' ? '校园生活' : '闯荡世界'}
                    </span>
                    <span>{albumData.date}</span>
                    <span>•</span>
                    <span>{albumData.location}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{albumData.title}</h1>
                <p className="text-gray-600 mt-4 max-w-2xl text-lg">{albumData.description}</p>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {albumData.images.map((img, idx) => (
                    <div key={idx} className="break-inside-avoid relative group overflow-hidden rounded-2xl">
                        <img 
                            src={img} 
                            alt={`Gallery ${idx}`} 
                            onClick={() => setLightboxImg(img)}
                            className="w-full object-cover hover:opacity-90 transition-opacity duration-300 rounded-2xl cursor-zoom-in"
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  // -- MAIN LIST VIEW --
  return (
    <div className="w-full">
      {/* Video Modal (Full Screen) */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in">
            <button 
                onClick={closeVideoModal} 
                className="absolute top-6 right-6 text-white/50 hover:text-white z-50 transition-colors p-2"
                title="关闭视频"
            >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
                {!isVideoPlaying && (
                    <div 
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 cursor-pointer group"
                        onClick={handlePlayVideo}
                    >
                        {/* Poster Image */}
                        <img src={MY_INTRO_POSTER} className="absolute inset-0 w-full h-full object-contain opacity-80" alt="Cover" />
                        
                        {/* Play Button */}
                        <div className="relative z-30 w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-white/50">
                            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                )}
                
                <video 
                    ref={videoRef}
                    src={MY_INTRO_VIDEO} 
                    controls 
                    className="w-full h-full object-contain"
                    disablePictureInPicture
                    controlsList="nodownload"
                >
                    您的浏览器不支持视频播放。
                </video>
            </div>
        </div>
      )}

      {/* Hero Section with Video Background */}
      <div className="relative w-full h-[80vh] bg-gray-100 flex flex-col justify-end pb-12 px-6 md:px-12 mb-12 overflow-hidden rounded-b-[3rem]">
        <div className="absolute inset-0 z-0">
             <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover grayscale opacity-60"
             >
                <source src={HERO_BG_VIDEO} type="video/mp4" />
             </video>
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-4 drop-shadow-lg">
              我的世界<br/>即刻创造
            </h1>
            <p className="text-white text-lg md:text-xl font-medium mb-8 max-w-xl drop-shadow-md">
               探索科技、设计与日常生活的边界。这里是小田的数字花园，记录每一个值得铭记的瞬间。
            </p>
            <div className="flex space-x-4">
                <button 
                    onClick={() => setShowVideo(true)}
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    开始浏览
                </button>
                <Link 
                    to="/profile"
                    className="bg-transparent border border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-colors"
                >
                    关于小田
                </Link>
            </div>
        </div>
      </div>

      {/* Content Grid (Unified Feed) */}
      <div className="max-w-[1440px] mx-auto px-6 mb-24">
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight">最新动态</h2>
            <span className="text-sm font-medium text-gray-500">综合展示 ({feed.length})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6">
          {feed.map((item, idx) => {
             // Determine content based on type
             let title, desc, date, category, img, likes;
             
             if (item.type === 'knowledge') {
                 const k = item.data as KnowledgeItem;
                 title = k.title;
                 desc = k.content;
                 date = k.date;
                 category = k.category || '知识积累';
                 img = k.imageUrl;
                 likes = k.likes || 0;
             } else {
                 const a = item.data as Album;
                 title = a.title;
                 desc = a.description;
                 date = a.date;
                 category = item.type === 'campus' ? '校园生活' : '闯荡世界';
                 img = a.coverUrl;
                 likes = a.likes || 0;
             }

             return (
                <article key={idx} onClick={() => setSelectedItem(item)} className="group cursor-pointer">
                <div className="relative bg-[#f5f5f5] aspect-square mb-4 overflow-hidden flex items-center justify-center rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
                    {img ? (
                        <img 
                            src={img} 
                            alt={title} 
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-3xl"
                        />
                    ) : (
                        <div className="p-8 text-center w-full h-full flex flex-col justify-center items-center bg-gray-100 rounded-3xl">
                             <div className="mb-2">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                             </div>
                             <p className="text-gray-500 font-bold text-sm line-clamp-3 px-4">{desc}</p>
                        </div>
                    )}
                    {/* Overlay Category Tag */}
                    <div className="absolute top-4 left-4">
                        <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${
                            item.type === 'campus' ? 'bg-blue-600' : 
                            item.type === 'adventure' ? 'bg-black' : 'bg-orange-600'
                        }`}>
                            {category}
                        </span>
                    </div>
                </div>
                <div className="space-y-2 px-2">
                    <h3 className="text-lg font-bold text-black leading-tight group-hover:text-gray-600 transition-colors">
                    {title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                    {desc}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                        <span>{date}</span>
                        <div className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            {likes}
                        </div>
                    </div>
                </div>
                </article>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default Journal;