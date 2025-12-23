import React, { useState, useEffect } from 'react';
import { blogPosts, campusAlbums, adventureAlbums } from '../data/mockData';
import { KnowledgeItem } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [sectionMatch, setSectionMatch] = useState<{name: string, path: string} | null>(null);
  const [results, setResults] = useState<{
    posts: typeof blogPosts;
    campus: typeof campusAlbums;
    adventure: typeof adventureAlbums;
    knowledge: KnowledgeItem[];
  }>({ posts: [], campus: [], adventure: [], knowledge: [] });

  const navigate = useNavigate();

  // Load knowledge from local storage for search
  const [localKnowledge, setLocalKnowledge] = useState<KnowledgeItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('knowledge_items');
    if (saved) {
      setLocalKnowledge(JSON.parse(saved));
    } else {
        // Fallback default mock for search context if LS is empty
        setLocalKnowledge([
             { id: '1', title: 'React Hooks 深度解析', content: '...', date: '...', tags: ['React'], category: '科技', likes: 0 },
             { id: '2', title: '极简摄影构图法', content: '...', date: '...', tags: ['Photo'], category: '生活', likes: 0 }
        ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ posts: [], campus: [], adventure: [], knowledge: [] });
      setSectionMatch(null);
      return;
    }

    const lowerQ = query.toLowerCase();

    // Check for Section Matches
    if ('校园生活'.includes(lowerQ) || 'campus'.includes(lowerQ)) setSectionMatch({ name: '校园生活', path: '/campus' });
    else if ('闯荡世界'.includes(lowerQ) || 'world'.includes(lowerQ) || 'adventure'.includes(lowerQ)) setSectionMatch({ name: '闯荡世界', path: '/world' });
    else if ('知识积累'.includes(lowerQ) || 'knowledge'.includes(lowerQ)) setSectionMatch({ name: '知识积累', path: '/knowledge' });
    else if ('留言簿'.includes(lowerQ) || 'guestbook'.includes(lowerQ)) setSectionMatch({ name: '留言簿', path: '/guestbook' });
    else if ('关于'.includes(lowerQ) || 'profile'.includes(lowerQ)) setSectionMatch({ name: '关于小田', path: '/profile' });
    else setSectionMatch(null);

    const filteredPosts = blogPosts.filter(p => 
      p.title.toLowerCase().includes(lowerQ) || p.content.toLowerCase().includes(lowerQ) || p.category.toLowerCase().includes(lowerQ)
    );
    const filteredCampus = campusAlbums.filter(a => 
      a.title.toLowerCase().includes(lowerQ) || (a.description || '').toLowerCase().includes(lowerQ) || a.location.toLowerCase().includes(lowerQ)
    );
    const filteredAdventure = adventureAlbums.filter(a => 
      a.title.toLowerCase().includes(lowerQ) || (a.description || '').toLowerCase().includes(lowerQ) || a.location.toLowerCase().includes(lowerQ)
    );
    const filteredKnowledge = localKnowledge.filter(k => 
      k.title.toLowerCase().includes(lowerQ) || k.content.toLowerCase().includes(lowerQ) || (k.tags || []).some(t => t.toLowerCase().includes(lowerQ))
    );

    setResults({
      posts: filteredPosts,
      campus: filteredCampus,
      adventure: filteredAdventure,
      knowledge: filteredKnowledge
    });
  }, [query, localKnowledge]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-gray-100">
        <svg className="w-6 h-6 text-black mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input 
          autoFocus
          type="text" 
          placeholder="搜索文章、相册或板块名称..." 
          className="flex-1 text-2xl font-black uppercase outline-none bg-transparent placeholder-gray-300"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6 md:px-20">
        {!query && (
          <div className="h-full flex items-center justify-center text-gray-300 font-bold uppercase text-4xl opacity-20">
            请输入关键词
          </div>
        )}

        {/* Section Quick Link */}
        {sectionMatch && (
            <div 
                onClick={() => { onClose(); navigate(sectionMatch.path); }}
                className="bg-black text-white p-6 rounded-3xl mb-8 flex justify-between items-center cursor-pointer hover:scale-[1.01] transition-transform"
            >
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">跳转至板块</span>
                    <h2 className="text-3xl font-black">{sectionMatch.name}</h2>
                </div>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </div>
        )}

        {(results.posts.length > 0 || results.campus.length > 0 || results.adventure.length > 0 || results.knowledge.length > 0) && (
           <div className="space-y-12 pb-20">
              {(results.campus.length > 0 || results.adventure.length > 0) && (
                <section>
                  <h3 className="text-sm font-bold uppercase text-gray-400 mb-6 tracking-widest">相册 ({results.campus.length + results.adventure.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...results.campus, ...results.adventure].map(album => (
                        <div key={album.id} className="bg-gray-100 aspect-square relative group rounded-2xl overflow-hidden">
                            <img src={album.coverUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                            <div className="absolute bottom-0 left-0 p-2 bg-black/50 text-white w-full">
                                <p className="font-bold text-sm truncate">{album.title}</p>
                            </div>
                        </div>
                    ))}
                  </div>
                </section>
              )}

              {results.knowledge.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase text-gray-400 mb-6 tracking-widest">知识积累 ({results.knowledge.length})</h3>
                  <div className="grid gap-4">
                    {results.knowledge.map(item => (
                       <div key={item.id} className="border-l-4 border-black pl-4">
                         <h4 className="text-xl font-bold">{item.title}</h4>
                         <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.content}</p>
                       </div>
                    ))}
                  </div>
                </section>
              )}
           </div>
        )}
        
        {query && !sectionMatch && Object.values(results).every((arr: any) => arr.length === 0) && (
            <div className="text-center text-gray-400 mt-20">没有找到相关内容</div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;