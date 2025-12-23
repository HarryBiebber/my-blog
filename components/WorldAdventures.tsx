import React, { useState, useEffect } from 'react';
import { adventureAlbums as initialMockData } from '../data/mockData';
import { Album } from '../types';
import { fileToBase64 } from '../utils/audioUtils';

// 👇👇👇 闯荡世界 顶部背景视频 👇👇👇
const WORLD_HERO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";

const WorldAdventures: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  
  // Admin Check
  const [isAdmin, setIsAdmin] = useState(false);

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCover, setNewCover] = useState<string | null>(null);
  const [newImages, setNewImages] = useState<string[]>([]);

  // Initialize data
  useEffect(() => {
      const checkAdmin = () => {
          setIsAdmin(localStorage.getItem('IS_ADMIN') === 'true');
      };
      checkAdmin();
      window.addEventListener('adminChange', checkAdmin);

      const saved = localStorage.getItem('world_albums');
      if (saved) {
          setAlbums(JSON.parse(saved));
      } else {
          setAlbums(initialMockData);
      }

      return () => {
          window.removeEventListener('adminChange', checkAdmin);
      };
  }, []);

  const saveAlbums = (updated: Album[]) => {
      setAlbums(updated);
      localStorage.setItem('world_albums', JSON.stringify(updated));
  };

  const getLikes = (album: Album) => {
      return (album.likes || 0) + (localLikes[album.id] || 0);
  }

  const handleLike = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const key = `liked_adventure_${id}`;
      if (localStorage.getItem(key)) {
          alert("已经点赞过啦！");
          return;
      }
      setLocalLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      localStorage.setItem(key, 'true');

      // Persist like to object structure
      const updated = albums.map(a => a.id === id ? {...a, likes: (a.likes || 0) + 1} : a);
      saveAlbums(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(window.confirm("确定删除这个旅程吗？")) {
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

  // Helper to detect if source is video
  const isVideo = (src: string) => {
      return src.startsWith('data:video') || src.toLowerCase().endsWith('.mp4');
  };

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
      <div className="w-full min-h-screen bg-black text-white animate-fade-in">
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
            {/* Back Button */}
            <button 
                onClick={() => setSelectedAlbum(null)}
                className="flex items-center text-sm font-bold uppercase tracking-wide mb-8 text-gray-400 hover:text-white"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                返回列表
            </button>

            {/* Album Header */}
            <div className="mb-12 border-b border-gray-800 pb-8">
                <div className="flex items-center space-x-3 text-gray-400 font-bold uppercase text-xs mb-2">
                    <span className="bg-white text-black px-1 rounded-sm">{selectedAlbum.date}</span>
                    <span>{selectedAlbum.location}</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">{selectedAlbum.title}</h1>
                <p className="text-gray-400 text-lg max-w-3xl">{selectedAlbum.description}</p>
            </div>

            {/* Cinematic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {selectedAlbum.images.map((img, idx) => (
                    <div key={idx} className={`relative group overflow-hidden ${idx % 3 === 0 ? 'md:col-span-2 aspect-video' : 'aspect-square'}`}>
                        {isVideo(img) ? (
                            <video 
                                src={img} 
                                muted
                                loop
                                onMouseOver={e => e.currentTarget.play()}
                                onMouseOut={e => e.currentTarget.pause()}
                                onClick={() => setLightboxImg(img)}
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 cursor-zoom-in"
                            />
                        ) : (
                            <img 
                                src={img} 
                                alt={`Gallery ${idx}`} 
                                onClick={() => setLightboxImg(img)}
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 cursor-zoom-in"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Header - Inverse Style with Video Background */}
      <div className="relative h-[50vh] flex flex-col justify-center items-center text-center overflow-hidden rounded-b-[3rem]">
         <div className="absolute inset-0 z-0">
             <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover opacity-50"
             >
                <source src={WORLD_HERO_VIDEO} type="video/mp4" />
             </video>
             <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white">闯荡世界</h1>
            <p className="text-gray-200 font-medium text-lg">
            世界那么大，我想去看看。记录每一次出发与抵达。
            </p>
        </div>
      </div>

       {/* Toolbar (Admin Only) */}
       {isAdmin && (
        <div className="max-w-[1440px] mx-auto px-6 mt-8 flex justify-end">
            <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-white text-black border border-gray-200 px-6 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-all shadow-md"
                >
                    <span className="text-xl leading-none mb-0.5">+</span>
                    <span>新增旅程</span>
                </button>
        </div>
       )}

      {/* Grid */}
      <div className="max-w-[1440px] mx-auto px-6 mt-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {albums.map((item) => (
            <div key={item.id} onClick={() => setSelectedAlbum(item)} className="group cursor-pointer relative h-[500px] overflow-hidden rounded-3xl">
               <img 
                  src={item.coverUrl} 
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-3xl" 
               />
               
               {/* Overlay Gradient */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 rounded-3xl"></div>

                {/* Delete Button (Admin Only) */}
                 {isAdmin && (
                    <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                        title="删除旅程"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                 )}

               {/* Like Button */}
               <button 
                  onClick={(e) => handleLike(item.id, e)}
                  className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full hover:bg-white hover:text-red-500 text-white transition-colors z-20"
               >
                  <div className="flex items-center space-x-1 px-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      <span className="text-xs font-bold">{getLikes(item)}</span>
                  </div>
               </button>

               {/* Content */}
               <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase bg-white text-black px-2 py-1 rounded-sm">
                        {item.date}
                    </span>
                    <span className="text-xs font-bold uppercase border border-white/30 px-2 py-1 rounded-sm">
                        {item.images.length} 媒体
                    </span>
                 </div>
                 <h3 className="text-2xl font-black uppercase mb-1">{item.title}</h3>
                 <div className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <span className="mr-2">📍</span> {item.location}
                 </div>
                 <p className="text-gray-400 text-sm line-clamp-2 group-hover:text-white transition-colors">
                    {item.description}
                 </p>
               </div>
            </div>
          ))}
        </div>
      </div>

       {/* Add Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md p-4 animate-fade-in text-black">
            <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black uppercase mb-6">新增旅程</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">标题</label>
                        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl font-bold border-none" placeholder="例如：北欧极光之旅" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">地点</label>
                        <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl border-none" placeholder="例如：冰岛" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">描述</label>
                        <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl resize-none h-24 border-none" placeholder="关于这段旅程..." />
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
                    <button onClick={handleAddAlbum} disabled={!newTitle || !newLocation || !newCover} className="px-6 py-3 bg-black text-white font-bold rounded-full disabled:opacity-50">保存</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default WorldAdventures;