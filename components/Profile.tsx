import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center animate-fade-in">
      {/* Increased max-width and padding for a looser feel */}
      <div className="max-w-7xl w-full mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-32 items-start justify-center">
          
          {/* Left Column: Photo & Contact */}
          <div className="md:w-5/12 flex flex-col items-center md:items-end w-full sticky top-24">
            {/* Photo container */}
            <div className="w-64 h-80 overflow-hidden rounded-sm mb-10 shadow-2xl rotate-[-1deg] hover:rotate-0 transition-transform duration-700">
              <img 
                src="https://picsum.photos/seed/xiaotian/800/1200" 
                alt="Xiaotian" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Info Block */}
            <div className="text-center md:text-right space-y-6 w-full max-w-sm">
              <h2 className="text-5xl font-black uppercase tracking-tight text-black">小田</h2>
              
              <div className="flex flex-col space-y-3 text-sm font-bold text-gray-500 md:items-end tracking-wide">
                  <a href="https://www.seu.edu.cn" target="_blank" rel="noreferrer" className="hover:text-blue-700 hover:underline flex items-center justify-center md:justify-end group transition-colors">
                      东南大学 (SEU)
                      <svg className="w-4 h-4 ml-2 text-gray-300 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </a>
                  <div className="flex items-center justify-center md:justify-end">
                      集成电路工程
                      <svg className="w-4 h-4 ml-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <a href="https://www.google.com/maps/place/Nanjing,+Jiangsu,+China" target="_blank" rel="noreferrer" className="hover:text-red-600 hover:underline flex items-center justify-center md:justify-end group transition-colors">
                      中国 · 南京
                      <svg className="w-4 h-4 ml-2 text-gray-300 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </a>
                  <a href="mailto:230249472@seu.edu.cn" className="hover:text-black hover:underline flex items-center justify-center md:justify-end group transition-colors">
                      230249472@seu.edu.cn
                      <svg className="w-4 h-4 ml-2 text-gray-300 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </a>
              </div>

              <div className="mt-8 flex justify-center md:justify-end space-x-4 pt-6 border-t border-gray-100">
                   <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">B</div>
                   <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">G</div>
                   <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">X</div>
              </div>
            </div>
          </div>

          {/* Vertical Divider (Desktop only) */}
          <div className="hidden md:block w-px bg-gray-100 self-stretch"></div>

          {/* Right Column: Intro & Achievements */}
          <div className="md:w-6/12 space-y-16 pt-8">
            
            <section>
              <h3 className="text-xs font-bold uppercase text-gray-400 mb-8 tracking-[0.2em] flex items-center">
                  关于我 <span className="h-px bg-gray-100 w-12 ml-4"></span>
              </h3>
              <div className="prose prose-xl text-gray-800 font-medium leading-loose">
                <p>
                  你好，我是小田。
                </p>
                <p className="text-gray-600">
                  一名就读于<span className="text-black font-bold">东南大学</span>集成电路工程专业的研究生。
                  在代码逻辑与硅片纹理之间，我也是一名热衷于探索世界的开发者与创作者。
                </p>
                <p className="text-gray-600">
                  我相信技术（IC/AI）与艺术的结合能创造出最动人的叙事。在这个博客里，我记录校园生活的点滴，
                  分享在世界各地的足迹，以及在芯片设计与编程道路上的每一次顿悟。
                </p>
                <p className="font-bold text-black mt-8">
                  永远保持好奇，永远在路上。
                </p>
              </div>
            </section>

            <section>
               <h3 className="text-xs font-bold uppercase text-gray-400 mb-8 tracking-[0.2em] flex items-center">
                   成果与荣誉 <span className="h-px bg-gray-100 w-12 ml-4"></span>
               </h3>
               <ul className="space-y-10">
                  <li className="flex items-start group">
                      <span className="text-gray-200 font-black text-4xl mr-8 group-hover:text-black transition-colors -mt-2">01</span>
                      <div>
                          <h4 className="text-2xl font-bold">全国大学生计算机设计大赛 一等奖</h4>
                          <p className="text-gray-500 font-medium mt-2">2023年 · 软件应用与开发组</p>
                      </div>
                  </li>
                  <li className="flex items-start group">
                      <span className="text-gray-200 font-black text-4xl mr-8 group-hover:text-black transition-colors -mt-2">02</span>
                      <div>
                          <h4 className="text-2xl font-bold">RoboMaster 机甲大师赛 区域赛冠军</h4>
                          <p className="text-gray-500 font-medium mt-2">2023年 · 视觉算法负责人</p>
                      </div>
                  </li>
                  <li className="flex items-start group">
                      <span className="text-gray-200 font-black text-4xl mr-8 group-hover:text-black transition-colors -mt-2">03</span>
                      <div>
                          <h4 className="text-2xl font-bold">大学生微电影节 最佳导演提名</h4>
                          <p className="text-gray-500 font-medium mt-2">2024年 · 作品《青春》</p>
                      </div>
                  </li>
               </ul>
            </section>

             <section>
               <h3 className="text-xs font-bold uppercase text-gray-400 mb-8 tracking-[0.2em] flex items-center">
                   技能栈 <span className="h-px bg-gray-100 w-12 ml-4"></span>
               </h3>
               <div className="flex flex-wrap gap-4">
                   {['Verilog', 'FPGA', 'Python', 'React', 'Photography', 'AI/LLM'].map(skill => (
                       <span key={skill} className="px-6 py-3 bg-white font-bold text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-colors cursor-default shadow-sm">
                           {skill}
                       </span>
                   ))}
               </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;