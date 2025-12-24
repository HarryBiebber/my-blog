import React, { useState, useEffect } from 'react';
import { KnowledgeItem } from '../types';
import { fileToBase64 } from '../utils/audioUtils';

// UPDATED CATEGORIES
const CATEGORIES = ['全部', 'IC', 'AI', 'Tools', '生活'];

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
  const [newCategory, setNewCategory] = useState('IC');
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
      // MASSIVE CONTENT INJECTION
      setItems([
        // --- IC (Digital Backend & K-Lib) ---
        {
            id: 'ic-1',
            title: 'Floorplanning (布局规划)',
            content: 'Floorplanning 是数字后端设计的第一步，也是最关键的一步。它决定了芯片的面积（Die Size）、IO 单元的位置、Macro（RAM/ROM/IP）的摆放以及电源网络（Power Grid）的规划。良好的 Floorplan 可以极大减少后期的布线拥塞和时序问题。',
            date: '2024-01-01',
            category: 'IC',
            tags: ['Backend', 'Floorplan'],
            likes: 0
        },
        {
            id: 'ic-2',
            title: 'Placement (标准单元放置)',
            content: '在 Floorplan 确定后，工具会自动将标准单元（Standard Cells）放置在 Core 区域。主要目标是最小化总线长（Wirelength）和拥塞（Congestion），同时满足时序约束。',
            date: '2024-01-02',
            category: 'IC',
            tags: ['Backend', 'Placement'],
            likes: 0
        },
        {
            id: 'ic-3',
            title: 'CTS (时钟树综合)',
            content: 'Clock Tree Synthesis 的目标是将时钟信号均匀地分发到芯片中的每一个时序单元（Flip-Flop）。关键指标包括 Skew（时钟偏差）和 Latency（延迟）。CTS 质量直接影响芯片的主频和保持时间（Hold Time）。',
            date: '2024-01-03',
            category: 'IC',
            tags: ['Backend', 'CTS'],
            likes: 0
        },
        {
            id: 'ic-4',
            title: 'Routing (布线)',
            content: '布线阶段将所有逻辑连接（Netlist）转化为实际的金属连线。分为 Global Routing（全局布线）和 Detail Routing（详细布线）。此阶段最容易出现 DRC 违例，如短路（Short）或开路（Open）。',
            date: '2024-01-04',
            category: 'IC',
            tags: ['Backend', 'Routing'],
            likes: 0
        },
        {
            id: 'ic-5',
            title: 'STA (静态时序分析)',
            content: 'STA 不依赖于测试向量，而是通过数学方法穷举所有时序路径。主要检查 Setup Time（建立时间）和 Hold Time（保持时间）。后端工程师需要修复所有违例（Violation）。',
            date: '2024-01-05',
            category: 'IC',
            tags: ['Backend', 'STA', 'Timing'],
            likes: 0
        },
        {
            id: 'ic-6',
            title: 'Physical Verification (DRC/LVS)',
            content: 'DRC (Design Rule Check) 检查版图是否符合晶圆厂的制造规则（如最小线宽、间距）。LVS (Layout Versus Schematic) 检查版图的连接关系是否与网表一致。',
            date: '2024-01-06',
            category: 'IC',
            tags: ['Backend', 'Signoff'],
            likes: 0
        },
        {
            id: 'ic-7',
            title: 'IR Drop (电压降分析)',
            content: '随着工艺节点缩小，线阻增加，电源网络上的电压降不可忽视。IR Drop 过大可能导致逻辑翻转速度变慢（影响 Setup）甚至功能错误。需要使用 Redhawk 等工具进行动态分析。',
            date: '2024-01-07',
            category: 'IC',
            tags: ['Backend', 'Power'],
            likes: 0
        },
        {
            id: 'ic-8',
            title: 'Standard Cell Characterization (K库)',
            content: 'K库流程是使用 SPICE 仿真工具（如 Liberate）对标准单元进行特征化，生成 .lib 文件。这包含时序（Timing）、功耗（Power）和噪声（Noise）信息，供后端工具使用。',
            date: '2024-01-08',
            category: 'IC',
            tags: ['K-Lib', 'Standard Cell'],
            likes: 0
        },
        {
            id: 'ic-9',
            title: 'PVT Corners (工艺角)',
            content: '芯片需要在不同的工艺（Process）、电压（Voltage）和温度（Temperature）下工作。K库需要覆盖 SS（Slow-Slow）、FF（Fast-Fast）和 TT（Typical）等多个 Corner，以确保芯片在最恶劣环境下也能工作。',
            date: '2024-01-09',
            category: 'IC',
            tags: ['K-Lib', 'PVT'],
            likes: 0
        },
        {
            id: 'ic-10',
            title: 'Antenna Effect (天线效应)',
            content: '在制造过程中，长金属线会收集电荷。如果电荷积累过多，会击穿连接的栅极氧化层。解决方法包括跳线（Jumper）到高层金属或插入二极管（Diode）。',
            date: '2024-01-10',
            category: 'IC',
            tags: ['Backend', 'Reliability'],
            likes: 0
        },

        // --- AI (Machine Learning & Deep Learning) ---
        {
            id: 'ai-1',
            title: '机器学习 vs 深度学习',
            content: '机器学习（ML）是 AI 的子集，使用算法解析数据并做出预测。深度学习（DL）是 ML 的子集，特指使用多层神经网络（Neural Networks）来模拟人脑学习过程的技术，擅长处理图像和文本等非结构化数据。',
            date: '2024-02-01',
            category: 'AI',
            tags: ['Basics'],
            likes: 0
        },
        {
            id: 'ai-2',
            title: 'Neural Networks (神经网络)',
            content: '神经网络由输入层、隐藏层和输出层组成。每个神经元都有权重（Weight）和偏置（Bias）。通过反向传播算法（Backpropagation）计算梯度，并使用梯度下降（Gradient Descent）更新权重，从而最小化损失函数。',
            date: '2024-02-02',
            category: 'AI',
            tags: ['Deep Learning'],
            likes: 0
        },
        {
            id: 'ai-3',
            title: 'Transformer & Self-Attention',
            content: 'Transformer 彻底改变了 NLP 领域。其核心是自注意力机制（Self-Attention），允许模型在处理序列时关注输入的不同部分，无论距离多远。这解决了 RNN 处理长序列时的梯度消失问题。',
            date: '2024-02-03',
            category: 'AI',
            tags: ['NLP', 'Transformer'],
            likes: 0
        },
        {
            id: 'ai-4',
            title: 'GNN (图神经网络)',
            content: 'GNN 专门用于处理图结构数据（如社交网络、分子结构）。它通过聚合邻居节点的信息来更新当前节点的特征表示。在推荐系统和新药研发中有广泛应用。',
            date: '2024-02-04',
            category: 'AI',
            tags: ['GNN', 'Graph'],
            likes: 0
        },

        // --- Tools (Linux, Git, etc.) ---
        {
            id: 'tool-1',
            title: 'Linux: Grep & Awk 文本处理神器',
            content: 'Grep 用于搜索文本，Awk 用于处理列数据。例如：\n`grep "Error" log.txt | awk \'{print $2}\'` \n这条命令可以快速从日志中提取报错的时间戳（假设时间戳在第二列）。后端工程师必备技能。',
            date: '2024-03-01',
            category: 'Tools',
            tags: ['Linux', 'Shell'],
            likes: 0
        },
        {
            id: 'tool-2',
            title: 'Git Workflow: Rebase vs Merge',
            content: 'Merge 会保留所有提交历史并产生 Merge Commit，适合主分支合并。Rebase 会重写历史，使提交线变成直线，适合个人开发分支整理。保持 Git 历史整洁是专业素养的体现。',
            date: '2024-03-02',
            category: 'Tools',
            tags: ['Git', 'DevOps'],
            likes: 0
        },

        // --- Life ---
        {
            id: 'life-1',
            title: '番茄工作法 (Pomodoro)',
            content: '设定 25 分钟专注工作，然后休息 5 分钟。每 4 个循环大休息一次。这利用了人的注意力周期，避免长时间工作的倦怠感，极大提高效率。',
            date: '2024-04-01',
            category: '生活',
            tags: ['Efficiency'],
            likes: 0
        },
        {
            id: 'life-2',
            title: '数码断舍离',
            content: '定期清理手机 APP，关闭非必要通知。尝试每天睡前 1 小时不看屏幕。你会发现焦虑感降低，睡眠质量显著提升。',
            date: '2024-04-02',
            category: '生活',
            tags: ['Minimalism'],
            likes: 0
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
    setNewCategory('IC');
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

  // Scroll to item function for TOC
  const scrollToItem = (id: string) => {
      const element = document.getElementById(`knowledge-card-${id}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    <div className="max-w-[1440px] mx-auto px-6 py-12 animate-fade-in">
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

      <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {filteredItems.map((item) => (
                <div 
                    id={`knowledge-card-${item.id}`}
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="relative bg-white p-8 rounded-3xl border border-gray-100 hover:border-black transition-all hover:shadow-xl group cursor-pointer scroll-mt-24"
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

          {/* Table of Contents (Desktop Sticky) */}
          {filter === '全部' && items.length > 0 && (
              <div className="hidden lg:block w-80 relative">
                  <div className="sticky top-24 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <h3 className="font-black uppercase text-sm text-gray-400 mb-4 tracking-wider">目录索引</h3>
                      <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                          {items.map((item, idx) => (
                              <button
                                key={item.id}
                                onClick={() => scrollToItem(item.id)}
                                className="block w-full text-left text-sm py-1.5 px-2 rounded hover:bg-gray-200 truncate text-gray-600 font-medium transition-colors"
                                title={item.title}
                              >
                                  <span className="text-xs text-gray-400 mr-2 font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                                  {item.title}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
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