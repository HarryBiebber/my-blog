import React, { useState, useEffect } from 'react';
import { KnowledgeItem } from '../types';
import { fileToBase64 } from '../utils/audioUtils';

const CATEGORIES = ['全部', '科技', 'IC', 'AI', '生活'];

const Knowledge: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('全部');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  
  // Admin Check
  const [isAdmin, setIsAdmin] = useState(false);

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('科技');
  const [newImage, setNewImage] = useState<string | null>(null);

  // Load from local storage and check admin
  useEffect(() => {
    // Check Admin Mode
    const checkAdmin = () => {
        setIsAdmin(localStorage.getItem('IS_ADMIN') === 'true');
    };
    checkAdmin();
    window.addEventListener('adminChange', checkAdmin);

    const saved = localStorage.getItem('knowledge_items');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      // Default items with real IC/Tech content
      setItems([
        {
            id: '1',
            title: 'Verilog 阻塞与非阻塞赋值的区别',
            content: '在时序逻辑中（always @(posedge clk)），应该使用非阻塞赋值 (<=)，以避免竞争冒险，确保所有寄存器在同一时钟沿同时更新。\n\n在组合逻辑中（always @(*)），应该使用阻塞赋值 (=)，以便逻辑级联能够正确传递。混用这两者是新手最容易犯的错误之一。',
            date: '2023-10-01',
            category: 'IC',
            tags: ['FPGA', 'Verilog'],
            likes: 42
        },
        {
            id: '2',
            title: '跨时钟域处理 (CDC) 基础',
            content: '单bit信号穿越到快时钟域需要打两拍（Double Flop）来消除亚稳态。\n\n对于多bit信号或总线，不能简单打两拍，因为各个bit路径延迟不同会导致数据错乱。此时应使用异步FIFO或者握手信号（Handshake）机制来保证数据的一致性。',
            date: '2023-11-12',
            category: 'IC',
            tags: ['CDC', 'Digital Design'],
            likes: 128
        },
        {
             id: '3',
             title: 'React UseEffect 依赖陷阱',
             content: '当 useEffect 中的代码依赖于外部变量时，必须将其加入依赖数组。如果遗漏，闭包会捕获旧值。如果加入对象或数组作为依赖，要注意引用稳定性，必要时使用 useMemo 或 useRef。',
             date: '2024-01-15',
             category: '科技',
             tags: ['React', 'Frontend'],
             likes: 35
        }
      ]);
    }
    
    return () => {
        window.removeEventListener('adminChange', checkAdmin);
    };
  }, []);

  // Save helper
  const saveItems = (updated: KnowledgeItem[]) => {
      setItems(updated);
      localStorage.setItem('knowledge_items', JSON.stringify(updated));
  }

  const handleAdd = () => {
    if (!newTitle || !newContent) return;
    
    const newItem: KnowledgeItem = {
        id: Date.now().toString(),
        title: newTitle,
        content: newContent,
        date: new Date().toLocaleDateString(),
        category: newCategory,
        imageUrl: newImage || undefined,
        tags: newTag ? newTag.split(',').map(t => t.trim()) : [],
        likes: 0
    };

    const updated = [newItem, ...items];
    saveItems(updated);
    
    // Reset and Close
    setNewTitle('');
    setNewContent('');
    setNewTag('');
    setNewImage(null);
    setNewCategory('科技');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
      if (e) {
          e.preventDefault();
          e.stopPropagation();
      }
      
      if (window.confirm("确定要删除这条知识点吗？")) {
          const updated = items.filter(item => item.id !== id);
          saveItems(updated);
          if (selectedItem?.id === id) {
              setSelectedItem(null);
          }
      }
  };

  const handleLike = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      const storageKey = `liked_knowledge_${id}`;
      if (localStorage.getItem(storageKey)) {
          alert("您已经点赞过了！");
          return;
      }

      const updated = items.map(item => {
          if (item.id === id) {
              return { ...item, likes: (item.likes || 0) + 1 };
          }
          return item;
      });
      saveItems(updated);
      localStorage.setItem(storageKey, 'true');

      // Also update selected item if open
      if (selectedItem?.id === id) {
          setSelectedItem(prev => prev ? ({ ...prev, likes: (prev.likes || 0) + 1 }) : null);
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          try {
              const base64 = await fileToBase64(e.target.files[0]);
              setNewImage(`data:${e.target.files[0].type};base64,${base64}`);
          } catch (err) {
              console.error("Image upload failed", err);
          }
      }
  };

  const filteredItems = filter === '全部' ? items : items.filter(item => item.category === filter);

  // -- DETAIL VIEW --
  if (selectedItem) {
      return (
          <div className="max-w-[1000px] mx-auto px-6 py-12 animate-fade-in">
             {lightboxImg && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
                    <img src={lightboxImg} alt="Zoomed" className="max-w-full max-h-full object-contain cursor-zoom-out" />
                </div>
             )}

              <button onClick={() => setSelectedItem(null)} className="mb-8 flex items-center font-bold text-gray-500 hover:text-black">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  返回列表
              </button>
              
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 relative">
                  {/* Actions in Detail View */}
                  <div className="absolute top-8 right-8 flex space-x-2">
                      <button 
                          onClick={() => handleLike(selectedItem.id)}
                          className="p-2 bg-gray-100 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                          title="点赞"
                      >
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      </button>
                      
                      {/* Only Admin can delete */}
                      {isAdmin && (
                        <button 
                            onClick={(e) => handleDelete(selectedItem.id, e)}
                            className="p-2 bg-gray-100 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                            title="删除"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      )}
                  </div>

                  <div className="mb-6">
                      <span className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded-full mb-3">{selectedItem.category}</span>
                      <h1 className="text-4xl md:text-5xl font-black">{selectedItem.title}</h1>
                      <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500 font-bold">
                          <span>{selectedItem.date}</span>
                          <span className="flex items-center text-red-500">
                             <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                             {selectedItem.likes || 0}
                          </span>
                      </div>
                  </div>

                  {selectedItem.imageUrl && (
                      <div className="mb-8 rounded-2xl overflow-hidden shadow-sm">
                          <img 
                            src={selectedItem.imageUrl} 
                            alt="attached" 
                            onClick={() => setLightboxImg(selectedItem.imageUrl || null)}
                            className="w-full object-cover cursor-zoom-in hover:opacity-95" 
                          />
                      </div>
                  )}

                  <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-loose">
                      {selectedItem.content}
                  </div>

                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-gray-100 flex gap-2">
                          {selectedItem.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-3 py-1 rounded-full">#{tag}</span>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // -- MAIN LIST --
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b-4 border-black pb-4 gap-4">
        <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">知识积累</h1>
            <p className="text-gray-500 font-medium mt-2">点滴积累，汇聚成海。</p>
        </div>
        {/* Only Admin can Add */}
        {isAdmin && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-transform hover:scale-105 flex items-center"
            >
                <span className="text-xl mr-2">+</span> 新增知识
            </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    filter === cat 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                  {cat}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        {filteredItems.map((item) => (
            <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="relative bg-white p-8 rounded-3xl border border-gray-100 hover:border-black transition-all hover:shadow-xl group cursor-pointer"
            >
                <div className="flex justify-between items-start mb-4 pr-16">
                    <div className="flex flex-col gap-2">
                        <span className="self-start text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full">{item.category}</span>
                        <h2 className="text-2xl font-bold group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h2>
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">{item.date}</span>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                    {item.content}
                </p>

                <div className="flex justify-between items-center mt-4">
                     <div className="flex gap-2">
                        {item.tags?.map((tag, idx) => (
                            <span key={idx} className="text-xs font-bold uppercase text-gray-400">#{tag}</span>
                        ))}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        <button 
                             onClick={(e) => handleLike(item.id, e)}
                             className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex items-center"
                             title="点赞"
                        >
                             <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                             <span className="text-xs font-bold">{item.likes || 0}</span>
                        </button>
                        
                        {/* Only Admin can Delete */}
                        {isAdmin && (
                            <button 
                                onClick={(e) => handleDelete(item.id, e)}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-300 hover:text-red-600 transition-colors"
                                title="删除"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ))}
        {filteredItems.length === 0 && (
            <div className="text-center text-gray-400 py-12">该分类下暂无内容</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black uppercase mb-6">记录新知识</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">标题</label>
                        <input 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-black font-bold"
                            placeholder="请输入标题..."
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">分类</label>
                        <div className="flex gap-2 flex-wrap">
                            {CATEGORIES.filter(c => c !== '全部').map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setNewCategory(cat)}
                                    className={`px-3 py-1 text-sm rounded-full border ${newCategory === cat ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">内容 (支持Markdown风格)</label>
                        <textarea 
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-black h-32 resize-none"
                            placeholder="在这里记录你的想法..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">配图 (可选)</label>
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                        />
                        {newImage && (
                            <img src={newImage} alt="Preview" className="mt-2 h-20 object-cover rounded-xl border" />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">标签 (用逗号分隔)</label>
                        <input 
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-black"
                            placeholder="例如: Tech, Life"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 font-bold text-gray-500 hover:text-black"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleAdd}
                        disabled={!newTitle || !newContent}
                        className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 disabled:opacity-50"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Knowledge;