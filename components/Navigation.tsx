import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  onSearchClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onSearchClick }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Listen for admin status changes
  useEffect(() => {
    const checkAdmin = () => {
        const status = localStorage.getItem('IS_ADMIN') === 'true';
        setIsAdmin(status);
    };
    checkAdmin();
    const interval = setInterval(checkAdmin, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
      // Direct confirm and force reload
      if(window.confirm("确认退出管理员模式？")) {
          localStorage.setItem('IS_ADMIN', 'false');
          setIsAdmin(false);
          window.location.reload(); 
      }
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => `
    px-3 py-2 text-sm font-black uppercase tracking-wide transition-all duration-200 border-b-2
    ${isActive(path) 
      ? 'border-black text-black' 
      : 'border-transparent text-gray-500 hover:text-black hover:border-gray-200'}
  `;

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex justify-between items-center relative">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center z-10 mr-8 group">
          <svg className="h-8 w-8 text-black group-hover:text-gray-700 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M12 7.5L13.5 10.5H16.5L14 12.5L15 15.5L12 13.5L9 15.5L10 12.5L7.5 10.5H10.5L12 7.5Z" fill="currentColor"/>
          </svg>
          <span className="ml-3 text-xl font-black italic tracking-tighter uppercase hidden sm:block">小田</span>
        </Link>
        
        {/* Center: Main Sections */}
        <div className="hidden lg:flex flex-1 justify-center space-x-6">
          <Link to="/" className={linkClass('/')}>最新动态</Link>
          <Link to="/campus" className={linkClass('/campus')}>校园生活</Link>
          <Link to="/knowledge" className={linkClass('/knowledge')}>知识积累</Link>
          <Link to="/world" className={linkClass('/world')}>闯荡世界</Link>
          <Link to="/guestbook" className={linkClass('/guestbook')}>留言簿</Link>
        </div>

        {/* Right: Tools, Admin Exit & Search */}
        <div className="flex items-center space-x-4 z-20">
           
           {/* ADMIN EXIT BUTTON - Made more prominent and robust */}
           {isAdmin && (
               <button 
                  type="button"
                  onClick={handleLogout}
                  className="hidden md:flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-700 transition-colors shadow-md cursor-pointer border-2 border-red-500 hover:border-red-700 active:scale-95"
               >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                   <span>退出管理</span>
               </button>
           )}

           <div className="hidden md:flex items-center space-x-3 border-l border-gray-200 pl-4">
             <button onClick={onSearchClick} title="站内搜索" className="p-2 text-gray-400 hover:text-black transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </button>
             <Link to="/studio" title="创意工坊" className="p-2 text-gray-400 hover:text-black transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             </Link>
             <Link to="/voice" title="实时对话" className="p-2 text-gray-400 hover:text-black transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
             </Link>
           </div>
           
           {/* Mobile Menu Button */}
           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-black">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
           </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 p-4 shadow-xl flex flex-col space-y-4 animate-fade-in z-50">
            {isAdmin && (
               <button onClick={handleLogout} className="text-red-600 font-bold uppercase text-lg text-left border-b border-red-100 pb-2 mb-2 w-full">退出管理员模式</button>
            )}
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-lg">最新动态</Link>
            <Link to="/campus" onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-lg">校园生活</Link>
            <Link to="/knowledge" onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-lg">知识积累</Link>
            <Link to="/world" onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-lg">闯荡世界</Link>
            <Link to="/guestbook" onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-lg">留言簿</Link>
            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-lg">关于小田</Link>
            <div className="border-t border-gray-100 pt-4 flex space-x-6">
                <button onClick={() => { setIsMenuOpen(false); onSearchClick(); }} className="text-sm font-bold text-gray-500">搜索内容</button>
                <Link to="/studio" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-gray-500">创意工坊</Link>
                <Link to="/voice" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-gray-500">实时对话</Link>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;