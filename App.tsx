import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Journal from './components/Journal';
import SmartSearch from './components/SmartSearch';
import CreativeStudio from './components/CreativeStudio';
import VoiceChat from './components/VoiceChat';
import CampusLife from './components/CampusLife';
import WorldAdventures from './components/WorldAdventures';
import Knowledge from './components/Knowledge';
import Guestbook from './components/Guestbook';
import SearchModal from './components/SearchModal';
import Profile from './components/Profile';

// Admin Login Modal Component
const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: (u: string, p: string) => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">管理员登录</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">Identity Verification</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">账号 (Username)</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full p-4 bg-gray-100 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            placeholder="请输入账号"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">密码 (Password)</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-4 bg-gray-100 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            placeholder="请输入密码"
                        />
                    </div>
                    <button 
                        onClick={() => onLogin(username, password)}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors mt-4 shadow-lg active:scale-95 transform duration-200"
                    >
                        确认进入
                    </button>
                </div>
            </div>
        </div>
    )
}

// Layout wrapper
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
      setIsAdmin(localStorage.getItem('IS_ADMIN') === 'true');
  }, []);

  const handleManagementClick = () => {
      if (isAdmin) {
          if(window.confirm("确定要退出管理员模式吗？")) {
            localStorage.setItem('IS_ADMIN', 'false');
            setIsAdmin(false);
            // Dispatch event so other components update immediately without reload
            window.dispatchEvent(new Event('adminChange'));
          }
      } else {
          setIsLoginOpen(true);
      }
  };

  const handleLogin = (u: string, p: string) => {
      if (u === 'tqx' && p === '20010208') {
          localStorage.setItem('IS_ADMIN', 'true');
          setIsAdmin(true);
          setIsLoginOpen(false);
          alert("欢迎回来，小田。管理员模式已激活。");
          // Dispatch event so other components update immediately without reload
          window.dispatchEvent(new Event('adminChange'));
      } else {
          alert("账号或密码错误，请重试。");
      }
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      <Navigation onSearchClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />
      
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-[#111111] text-white py-16">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-white">关于小田</h4>
                <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">技术架构</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Gemini API</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">联系作者</a></li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-white">获取帮助</h4>
                <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">API 状态</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">使用指南</a></li>
                </ul>
            </div>
             <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-white">社交媒体</h4>
                <div className="flex space-x-4 text-gray-400">
                    <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-white hover:text-black transition-colors flex items-center justify-center cursor-pointer">X</div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-white hover:text-black transition-colors flex items-center justify-center cursor-pointer">In</div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-white hover:text-black transition-colors flex items-center justify-center cursor-pointer">Gh</div>
                </div>
            </div>
             <div className="space-y-4 md:text-right">
                <p className="text-gray-500 text-xs">
                    &copy; {new Date().getFullYear()} 小田. 保留所有权利。<br/>
                    由 Google Gemini 提供支持。
                </p>
                {/* Management Entry Button */}
                <button 
                    onClick={handleManagementClick} 
                    className={`text-[10px] uppercase tracking-widest mt-4 transition-colors ${isAdmin ? 'text-green-500 hover:text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    {isAdmin ? 'Admin Mode Active' : 'Management Entry'}
                </button>
            </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Main Sections */}
          <Route path="/" element={<Journal />} />
          <Route path="/campus" element={<CampusLife />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/world" element={<WorldAdventures />} />
          <Route path="/guestbook" element={<Guestbook />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* AI Tools (Kept separate) */}
          <Route path="/smart-search" element={<SmartSearch />} />
          <Route path="/studio" element={<CreativeStudio />} />
          <Route path="/voice" element={<VoiceChat />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;