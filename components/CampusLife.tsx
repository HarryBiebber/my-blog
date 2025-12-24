import React, { useState, useEffect } from 'react';
import { campusAlbums as initialMockData } from '../data/mockData';
import { Album } from '../types';
import { fileToBase64 } from '../utils/audioUtils';

// CHANGED: Use a youthful/activity oriented video (ForBiggerJoyrides)
const DEFAULT_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

const CampusLife: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  
  // Admin & Config
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroVideo, setHeroVideo] = useState(DEFAULT_VIDEO);
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [newHeroUrl, setNewHeroUrl] = useState('');

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Modal State for Adding
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCover, setNewCover] = useState<string | null>(null);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
      const checkAdmin = () => {
          setIsAdmin(localStorage.getItem('IS_ADMIN') === 'true');
      };
      checkAdmin();
      window.addEventListener('adminChange', checkAdmin);

      const saved = localStorage.getItem('campus_albums');
      if (saved) {
          setAlbums(JSON.parse(saved));
      } else {
          setAlbums(initialMockData);
      }

      const savedVideo = localStorage.getItem('site_config_campus_video');
      if (savedVideo) setHeroVideo(savedVideo);

      return () => {
          window.removeEventListener('adminChange', checkAdmin);
      };
  }, []);

  const saveAlbums = (updated: Album[]) => {
      setAlbums(updated);
      localStorage.setItem('campus_albums', JSON.stringify(updated));
  };

  const handleSaveHero = () => {
      if(newHeroUrl) {
          setHeroVideo(newHeroUrl);
          localStorage.setItem('site_config_campus_video', newHeroUrl);
      }
      setIsEditingHero(false);
  };
  
  const handleLocalVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          setNewHeroUrl(url);
      }
  };

  const getLikes = (album: Album) => {
      return (album.likes || 0) + (localLikes[album.id] || 0);
  }

  const handleLike = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const key = `liked_campus_${id}`;
      if (localStorage.getItem(key)) {
          alert("已经点赞过啦！");
          return;
      }
      setLocalLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      localStorage.setItem(key, 'true');
      
      const updated = albums.map(a => a.id === id ? {...a, likes: (a.likes || 0) + 1} : a);
      saveAlbums(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      // Since button is now outside, preventDefault is enough for safety, stopPropagation is backup
      e.preventDefault();
      e.stopPropagation();
      
      if(window.confirm("【管理员操作】\n确定删除这个相册吗？此操作无法撤销。")) {
          const updated = albums.filter(a => a.id !== id);
          saveAlbums(updated);
          if (selectedAlbum?.id === id) {
              setSelectedAlbum(null);
          }
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
      if (e.target.files && e.target.files[0]) {
          try {
              const file = e.target.files[0];
              const base64 = await fileToBase64(file);
              const dataUrl = `data:${file.type};base64,${base64}`;
              if (isCover) {
                  setNewCover(dataUrl);
              } else {
                  setNewImages(prev => [...prev, dataUrl]);
              }
          } catch (err) {
              console.error("Upload failed", err);
          }
      }
  };

  const isVideo = (src: string) => src.startsWith('data:video') || src.toLowerCase().endsWith('.mp4');

  const handleAddAlbum = () => {
      if (!newTitle || !newLocation || !newCover) return;
      const newAlbum: Album = {
          id: Date.now().toString(),
          title: newTitle,
          location: newLocation,
          date: new Date().toLocaleDateString(),
          description: newDesc,
          coverUrl: newCover,
          images: newImages.length > 0 ? newImages : [newCover], 
          likes: 0
      };
      saveAlbums([newAlbum, ...albums]);
      setIsModalOpen(false);
      setNewTitle(''); setNewLocation(''); setNewDesc(''); setNewCover(null); setNewImages([]);
  };

  if (selectedAlbum) {
    return (
      <div className="w-full min-h-screen bg-white animate-fade-in">
        {lightboxImg && (
            <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
                {isVideo(lightboxImg) ? (
                    <video src={lightboxImg} controls autoPlay className="max-w-full max-h-full" onClick={e => e.stopPropagation()} />
                ) : (
                    <img src={lightboxImg} alt="Zoomed" className="max-w-full max-h-full object-contain cursor-zoom-out" />
                )}
            </div>
        )}
        <div className="max-w-[1440px] mx-auto px-6 py-12">
            <button onClick={() => setSelectedAlbum(null)} className="flex items-center text-sm font-bold uppercase tracking-wide mb-8 hover:text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                返回相册列表
            </button>
            <div className="mb-12">
                <div className="flex items-center space-x-3 text-gray-500 font-bold uppercase text-xs mb-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-md">校园生活</span>
                    <span>{selectedAlbum.date}</span>
                    <span>•</span>
                    <span>{selectedAlbum.location}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{selectedAlbum.title}</h1>
                <p className="text-gray-600 mt-4 max-w-2xl text-lg">{selectedAlbum.description}</p>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {selectedAlbum.images.map((img, idx) => (
                    <div key={idx} className="break-inside-avoid relative group overflow-hidden rounded-2xl">
                        {isVideo(img) ? <video src={img} muted loop onClick={() => setLightboxImg(img)} className="w-full object-cover rounded-2xl cursor-zoom-in"/> : <img src={img} alt={`Gallery ${idx}`} onClick={() => setLightboxImg(img)} className="w-full object-cover hover:opacity-90 transition-opacity duration-300 rounded-2xl cursor-zoom-in"/>}
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Hero Header */}
      <div className="relative h-[50vh] flex flex-col justify-center items-center text-center overflow-hidden rounded-b-[3rem] group">
        <div className="absolute inset-0 z-0">
             <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90" src={heroVideo} key={heroVideo}></video>
             <div className="absolute inset-0 bg-gray-900/30"></div>
        </div>
        
        {isAdmin && (
             <button onClick={() => setIsEditingHero(true)} className="absolute top-4 right-4 z-50 bg-white text-black px-4 py-2 rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 更换背景视频
             </button>
        )}

        <div className="relative z-10 text-white max-w-2xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-shadow drop-shadow-lg">校园生活</h1>
            <p className="font-medium text-lg text-gray-200 drop-shadow-md">记录在校的每一刻光阴。从图书馆的清晨到操场的黄昏。</p>
        </div>
      </div>

       {/* Hero Edit Modal */}
       {isEditingHero && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                   <h3 className="text-xl font-bold mb-4">更换背景视频</h3>
                   <p className="text-xs text-gray-500 mb-2">请输入 .mp4 视频链接 (推荐使用图床或CDN链接)</p>
                   <input value={newHeroUrl} onChange={e => setNewHeroUrl(e.target.value)} placeholder="https://example.com/video.mp4" className="w-full p-3 bg-gray-100 rounded-lg mb-2" />
                   
                   <div className="mb-4">
                      <label className="block text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                          + 或者选择本地视频 (仅供临时演示)
                          <input type="file" accept="video/mp4" className="hidden" onChange={handleLocalVideoSelect} />
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

      {/* Toolbar */}
      {isAdmin && (
        <div className="max-w-[1440px] mx-auto px-6 mt-8 flex justify-end">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-transform hover:scale-105 shadow-md">
                <span className="text-xl leading-none mb-0.5">+</span><span>新增相册</span>
            </button>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-[1440px] mx-auto px-6 mt-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album) => (
            <div key={album.id} className="relative group">
              {/* DELETE BUTTON: SIBLING, NOT CHILD of clickable area */}
              {isAdmin && (
                <button 
                    onClick={(e) => handleDelete(album.id, e)}
                    className="absolute top-2 right-2 z-50 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:bg-red-700 hover:scale-110 transition-all border-2 border-white cursor-pointer"
                    title="删除相册"
                    type="button"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              )}

              <div onClick={() => setSelectedAlbum(album)} className="cursor-pointer">
                <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden mb-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
                    {isVideo(album.coverUrl) ? <video src={album.coverUrl} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} /> : <img src={album.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full z-10">{album.date}</div>
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold rounded-full z-10">{album.images.length} 媒体</div>
                    
                    <button onClick={(e) => handleLike(album.id, e)} className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-500 hover:text-white text-red-500 transition-colors z-20">
                        <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            <span className="text-xs font-bold">{getLikes(album)}</span>
                        </div>
                    </button>
                </div>
                <div className="space-y-1 px-2">
                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {album.location}
                    </div>
                    <h3 className="text-2xl font-black text-black group-hover:underline decoration-2 underline-offset-4">{album.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed pt-2">{album.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

       {/* Add Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black uppercase mb-6">新增校园相册</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">标题</label>
                        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl font-bold" placeholder="例如：春季运动会" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">地点</label>
                        <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" placeholder="例如：北校区体育场" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">描述</label>
                        <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl resize-none h-24" placeholder="关于这个相册..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">封面 (支持图片或视频)</label>
                        <input type="file" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, true)} className="w-full text-sm" />
                        {newCover && (isVideo(newCover) ? <video src={newCover} className="mt-2 h-20" muted /> : <img src={newCover} className="mt-2 h-20 rounded-lg border" alt="Cover" />)}
                    </div>
                    <div>
                         <label className="block text-xs font-bold uppercase text-gray-500 mb-1">更多内容 (图片或视频)</label>
                         <input type="file" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, false)} className="w-full text-sm" />
                         <div className="flex gap-2 mt-2 flex-wrap">
                             {newImages.map((img, i) => (
                                 isVideo(img) ? 
                                 <div key={i} className="h-12 w-12 bg-black text-white flex items-center justify-center text-xs rounded">VID</div> 
                                 : <img key={i} src={img} className="h-12 w-12 rounded object-cover border" alt="Thumb" />
                             ))}
                         </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-500">取消</button>
                    <button onClick={handleAddAlbum} disabled={!newTitle || !newLocation || !newCover} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full disabled:opacity-50">保存</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CampusLife;