import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { campusAlbums, adventureAlbums } from '../data/mockData';
import { Album, KnowledgeItem } from '../types';

// 默认视频和封面
const DEFAULT_INTRO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const DEFAULT_INTRO_POSTER = "https://picsum.photos/seed/intro_poster/1920/1080";
const DEFAULT_HERO_BG_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";

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
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Custom Config State (Intro Video)
  const [introVideoUrl, setIntroVideoUrl] = useState(DEFAULT_INTRO_VIDEO);
  const [introPosterUrl, setIntroPosterUrl] = useState(DEFAULT_INTRO_POSTER);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  
  // Custom Config State (Hero Background)
  const [heroBgVideo, setHeroBgVideo] = useState(DEFAULT_HERO_BG_VIDEO);
  const [isEditingHero, setIsEditingHero] = useState(false);
  
  // Temp state for editing
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempPosterUrl, setTempPosterUrl] = useState('');
  const [newHeroUrl, setNewHeroUrl] = useState('');

  // Lightbox State
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Load data & config
  useEffect(() => {
    // Check Admin
    const checkAdmin = () => setIsAdmin(localStorage.getItem('IS_ADMIN') === 'true');
    checkAdmin();
    window.addEventListener('adminChange', checkAdmin);

    // Load Config
    const savedVideo = localStorage.getItem('site_intro_video');
    const savedPoster = localStorage.getItem('site_intro_poster');
    const savedHeroBg = localStorage.getItem('site_config_journal_hero');

    if (savedVideo) setIntroVideoUrl(savedVideo);
    if (savedPoster) setIntroPosterUrl(savedPoster);
    if (savedHeroBg) setHeroBgVideo(savedHeroBg);

    // 1. Campus
    const campusItems: FeedItem[] = campusAlbums.map(a => ({ type: 'campus', data: a }));
    // 2. Adventure
    const adventureItems: FeedItem[] = adventureAlbums.map(a => ({ type: 'adventure', data: a }));
    // 3. Knowledge
    const savedKnowledge = localStorage.getItem('knowledge_items');
    let knowledgeItems: FeedItem[] = [];
    if (savedKnowledge) {
        knowledgeItems = (JSON.parse(savedKnowledge) as KnowledgeItem[]).map(k => ({ type: 'knowledge', data: k }));
    } 

    // Merge and Sort by Date (Descending)
    const allItems = [...campusItems, ...adventureItems, ...knowledgeItems].sort((a, b) => {
        return a.data.date > b.data.date ? -1 : 1;
    });

    setFeed(allItems);

    return () => window.removeEventListener('adminChange', checkAdmin);
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

  // --- Intro Video Config ---
  const openConfigModal = () => {
      setTempVideoUrl(introVideoUrl);
      setTempPosterUrl(introPosterUrl);
      setIsEditingConfig(true);
  }

  const saveConfig = () => {
      if (tempVideoUrl) {
          setIntroVideoUrl(tempVideoUrl);
          localStorage.setItem('site_intro_video', tempVideoUrl);
      }
      if (tempPosterUrl) {
          setIntroPosterUrl(tempPosterUrl);
          localStorage.setItem('site_intro_poster', tempPosterUrl);
      }
      setIsEditingConfig(false);
      alert("个人展示视频已更新！");
  }

  // --- Hero Background Config ---
  const handleSaveHero = () => {
      if(newHeroUrl) {
          setHeroBgVideo(newHeroUrl);
          localStorage.setItem('site_config_journal_hero', newHeroUrl);
      }
      setIsEditingHero(false);
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'intro') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const localUrl = URL.createObjectURL(file);
          if (target === 'hero') {
              setNewHeroUrl(localUrl); // Just set the input, let user click save
          } else {
              setTempVideoUrl(localUrl);
          }
      }
  };

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
      
      {/* Edit INTRO Config Modal */}
      {isEditingConfig && (
          <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white w-full max-w-md p-6 rounded-2xl">
                  <h3 className="text-xl font-black mb-4 uppercase">配置个人展示视频</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">视频链接 (.mp4)</label>
                          <input 
                            value={tempVideoUrl} 
                            onChange={e => setTempVideoUrl(e.target.value)} 
                            className="w-full p-2 bg-gray-100 rounded border border-transparent focus:border-black outline-none text-sm"
                            placeholder="https://..."
                          />
                          <div className="mt-2">
                              <label className="block text-xs font-bold text-blue-600 mb-1 cursor-pointer hover:underline">
                                  + 选择本地视频 (临时预览)
                                  <input type="file" accept="video/mp4" className="hidden" onChange={(e) => handleLocalFileSelect(e, 'intro')} />
                              </label>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">封面图片链接</label>
                          <input 
                            value={tempPosterUrl} 
                            onChange={e => setTempPosterUrl(e.target.value)} 
                            className="w-full p-2 bg-gray-100 rounded border border-transparent focus:border-black outline-none text-sm"
                            placeholder="https://..."
                          />
                      </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                      <button onClick={() => setIsEditingConfig(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">取消</button>
                      <button onClick={saveConfig} className="px-4 py-2 bg-black text-white rounded font-bold text-sm">保存</button>
                  </div>
              </div>
          </div>
      )}

      {/* Edit HERO BACKGROUND Modal */}
      {isEditingHero && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-black">
               <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                   <h3 className="text-xl font-bold mb-4">更换首页背景视频</h3>
                   <p className="text-xs text-gray-500 mb-2">请输入 .mp4 视频链接</p>
                   <input value={newHeroUrl} onChange={e => setNewHeroUrl(e.target.value)} placeholder="https://..." className="w-full p-3 bg-gray-100 rounded-lg mb-2" />
                   
                   <div className="mb-6">
                      <label className="block text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                          + 或者选择本地视频 (仅供临时演示)
                          <input type="file" accept="video/mp4" className="hidden" onChange={(e) => handleLocalFileSelect(e, 'hero')} />
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">注意：本地视频在网页刷新后会失效。长期使用请填写URL。</p>
                   </div>

                   <div className="flex justify-end gap-2">
                       <button onClick={() => setIsEditingHero(false)} className="px-4 py-2 text-gray-500">取消</button>
                       <button onClick={handleSaveHero} className="px-4 py-2 bg-black text-white rounded-lg font-bold">保存</button>
                   </div>
               </div>
           </div>
       )}

      {/* Video Modal (Full Screen Player) */}
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
                        <img src={introPosterUrl} className="absolute inset-0 w-full h-full object-contain opacity-80" alt="Cover" />
                        
                        {/* Play Button */}
                        <div className="relative z-30 w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-white/50">
                            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                )}
                
                <video 
                    ref={videoRef}
                    src={introVideoUrl} 
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
      <div className="relative w-full h-[80vh] bg-gray-100 flex flex-col justify-end pb-12 px-6 md:px-12 mb-12 overflow-hidden rounded-b-[3rem] group">
        <div className="absolute inset-0 z-0">
             <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover opacity-90"
             >
                <source src={heroBgVideo} type="video/mp4" />
             </video>
             {/* Slightly darker overlay to ensure text readability on original color video */}
             <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Admin Edit Trigger for Hero Background */}
        {isAdmin && (
             <button onClick={() => setIsEditingHero(true)} className="absolute top-4 right-4 z-50 bg-white text-black px-4 py-2 rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg">
                 更换背景视频
             </button>
        )}
        
        <div className="relative z-10 max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-4 drop-shadow-2xl">
              我的世界<br/>即刻创造
            </h1>
            <p className="text-white text-lg md:text-xl font-medium mb-8 max-w-xl drop-shadow-lg text-shadow">
               探索科技、设计与日常生活的边界。这里是小田的数字花园，记录每一个值得铭记的瞬间。
            </p>
            <div className="flex space-x-4 items-center">
                <button 
                    onClick={() => setShowVideo(true)}
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center shadow-lg"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    开始浏览
                </button>
                
                {/* Admin Config Button (For Intro Video) */}
                {isAdmin && (
                    <button 
                        onClick={openConfigModal}
                        className="w-12 h-12 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black hover:text-green-400 transition-all border border-white/20"
                        title="配置介绍视频"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </button>
                )}

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