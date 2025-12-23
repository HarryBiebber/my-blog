import React, { useState, useEffect } from 'react';
import { GuestbookEntry } from '../types';

const Guestbook: React.FC = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // New Message State
  const [authorName, setAuthorName] = useState('');
  const [messageContent, setMessageContent] = useState('');
  
  // Reply State
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Load
  useEffect(() => {
    // Check Admin Mode
    const checkAdmin = () => {
        setIsAdmin(localStorage.getItem('IS_ADMIN') === 'true');
    };
    checkAdmin();
    window.addEventListener('adminChange', checkAdmin);

    const saved = localStorage.getItem('guestbook_entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      setEntries([
        {
            id: '1',
            author: 'Alice',
            content: '网站设计太酷了！非常喜欢这种黑白风格。',
            date: '2023-12-01 10:00',
            likes: 5,
            replies: [
                { id: 'r1', author: '博主', content: '谢谢 Alice！Nike 风格确实很有张力。', date: '2023-12-01 11:30'}
            ]
        }
      ]);
    }

    return () => {
        window.removeEventListener('adminChange', checkAdmin);
    };
  }, []);

  // Save helper
  const saveEntries = (newEntries: GuestbookEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('guestbook_entries', JSON.stringify(newEntries));
  };

  const handlePost = () => {
    if (!authorName || !messageContent) return;
    
    const newEntry: GuestbookEntry = {
        id: Date.now().toString(),
        author: authorName,
        content: messageContent,
        date: new Date().toLocaleString(),
        likes: 0,
        replies: []
    };
    
    saveEntries([newEntry, ...entries]);
    setAuthorName('');
    setMessageContent('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      // FIX: Stop propagation
      e.preventDefault();
      e.stopPropagation();

      if(window.confirm("确定删除这条留言吗？")) {
          const updated = entries.filter(e => e.id !== id);
          saveEntries(updated);
      }
  };

  const handleLike = (id: string) => {
    // Check if user already liked this specific post
    const storageKey = `liked_guestbook_${id}`;
    if (localStorage.getItem(storageKey)) {
        alert("您已经点赞过了，感谢支持！");
        return;
    }

    const updated = entries.map(entry => {
        if (entry.id === id) {
            return { ...entry, likes: entry.likes + 1 };
        }
        return entry;
    });
    saveEntries(updated);
    localStorage.setItem(storageKey, 'true'); // Mark as liked
  };

  const handleReplySubmit = (entryId: string) => {
    if (!replyContent) return;
    
    const updated = entries.map(entry => {
        if (entry.id === entryId) {
            return {
                ...entry,
                replies: [...entry.replies, {
                    id: Date.now().toString(),
                    author: '我 (博主)', // For demo purposes, reply as owner
                    content: replyContent,
                    date: new Date().toLocaleString()
                }]
            };
        }
        return entry;
    });
    
    saveEntries(updated);
    setReplyingTo(null);
    setReplyContent('');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">留言簿</h1>
        <p className="text-gray-500">留下你的声音，或者仅仅是打个招呼。</p>
      </div>

      {/* Input Area */}
      <div className="bg-gray-50 p-8 rounded-3xl mb-12 border border-gray-100 shadow-sm">
        <h3 className="font-bold uppercase text-sm mb-4">写下留言</h3>
        <div className="grid gap-4">
            <input 
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="你的昵称"
                className="p-4 bg-white border border-gray-200 rounded-xl focus:border-black focus:outline-none font-bold"
            />
            <textarea 
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="想说点什么..."
                className="p-4 bg-white border border-gray-200 rounded-xl focus:border-black focus:outline-none h-24 resize-none"
            />
            <button 
                onClick={handlePost}
                disabled={!authorName || !messageContent}
                className="bg-black text-white py-3 px-8 rounded-full font-bold self-start hover:bg-gray-800 disabled:opacity-50"
            >
                发布留言
            </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-8">
        {entries.map(entry => (
            <div key={entry.id} className="relative bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                {/* Delete Button (Only Admin) - FIXED Z-INDEX and Click */}
                {isAdmin && (
                    <button 
                        onClick={(e) => handleDelete(entry.id, e)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-100 p-2 z-50 cursor-pointer"
                        title="删除留言"
                    >
                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                )}

                <div className="flex justify-between items-start mb-4 pr-10">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-lg mr-4 uppercase">
                            {entry.author.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg leading-none mb-1">{entry.author}</h4>
                            <span className="text-xs text-gray-400">{entry.date}</span>
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-800 mb-6 text-lg leading-relaxed">{entry.content}</p>

                {/* Actions Bar */}
                <div className="flex items-center space-x-4 mb-4 border-t border-gray-50 pt-4">
                     <button 
                        onClick={() => handleLike(entry.id)}
                        className="flex items-center text-gray-400 hover:text-red-500 transition-colors text-sm font-bold bg-gray-50 px-3 py-1.5 rounded-full"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        {entry.likes}
                    </button>
                    {replyingTo !== entry.id && (
                        <button 
                            onClick={() => setReplyingTo(entry.id)}
                            className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider"
                        >
                            回复
                        </button>
                    )}
                </div>

                {/* Replies */}
                {entry.replies.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3 mb-4">
                        {entry.replies.map(reply => (
                            <div key={reply.id} className="text-sm">
                                <span className="font-bold">{reply.author}: </span>
                                <span className="text-gray-600">{reply.content}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reply Input */}
                {replyingTo === entry.id && (
                    <div className="flex items-center space-x-2 mt-2 bg-gray-50 p-2 rounded-xl">
                            <input 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="flex-1 bg-transparent outline-none px-2 text-sm"
                            placeholder="输入回复..."
                            autoFocus
                            />
                            <button onClick={() => handleReplySubmit(entry.id)} className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full">发送</button>
                            <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-400 px-2">取消</button>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default Guestbook;