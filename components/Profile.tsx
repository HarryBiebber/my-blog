import React, { useState, useEffect } from 'react';
import { fileToBase64 } from '../utils/audioUtils';

// Default data interface
interface ProfileData {
  name: string;
  avatar: string;
  university: string;
  major: string;
  location: string;
  email: string;
  intro: string;
  skills: string[];
  awards: { year: string; title: string; desc: string }[];
}

const DEFAULT_PROFILE: ProfileData = {
  name: '小田',
  avatar: 'https://picsum.photos/seed/xiaotian/800/1200',
  university: '东南大学 (SEU)',
  major: '集成电路工程',
  location: '中国 · 南京',
  email: '', // 已清空默认邮箱
  intro: "你好，我是小田。\n\n一名就读于东南大学集成电路工程专业的研究生。在代码逻辑与硅片纹理之间，我也是一名热衷于探索世界的开发者与创作者。\n\n我相信技术（IC/AI）与艺术的结合能创造出最动人的叙事。",
  skills: ['Verilog', 'FPGA', 'Python', 'React', 'Photography', 'AI/LLM'],
  awards: [
      { year: '2023', title: '全国大学生计算机设计大赛 一等奖', desc: '软件应用与开发组' },
      { year: '2023', title: 'RoboMaster 机甲大师赛 区域赛冠军', desc: '视觉算法负责人' },
      { year: '2024', title: '大学生微电影节 最佳导演提名', desc: '作品《青春》' }
  ]
};

const Profile: React.FC = () => {
  const [data, setData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 1. Check Admin
    const checkAdmin = () => setIsAdmin(localStorage.getItem('IS_ADMIN') === 'true');
    checkAdmin();
    window.addEventListener('adminChange', checkAdmin);

    // 2. Load Data
    const saved = localStorage.getItem('site_profile_data');
    if (saved) {
        setData(JSON.parse(saved));
    }

    return () => window.removeEventListener('adminChange', checkAdmin);
  }, []);

  const handleSave = () => {
      localStorage.setItem('site_profile_data', JSON.stringify(data));
      setIsEditing(false);
      alert("个人资料已更新！");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          try {
              const base64 = await fileToBase64(e.target.files[0]);
              setData({ ...data, avatar: `data:${e.target.files[0].type};base64,${base64}` });
          } catch(err) {
              console.error(err);
          }
      }
  };

  const handleAwardChange = (index: number, field: string, value: string) => {
      const newAwards = [...data.awards];
      newAwards[index] = { ...newAwards[index], [field]: value };
      setData({ ...data, awards: newAwards });
  };

  const addAward = () => {
      setData({ ...data, awards: [...data.awards, { year: '202X', title: '新奖项', desc: '描述...' }] });
  };

  const removeAward = (index: number) => {
      const newAwards = data.awards.filter((_, i) => i !== index);
      setData({ ...data, awards: newAwards });
  };

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center animate-fade-in relative">
      
      {/* Admin Toggle Edit Button */}
      {isAdmin && (
          <div className="absolute top-24 right-6 z-50">
              {isEditing ? (
                  <div className="flex space-x-2">
                      <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-black px-4 py-2 rounded-full font-bold">取消</button>
                      <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-green-700">保存更改</button>
                  </div>
              ) : (
                  <button onClick={() => setIsEditing(true)} className="bg-black text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-gray-800 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      编辑资料
                  </button>
              )}
          </div>
      )}

      <div className="max-w-7xl w-full mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-32 items-start justify-center">
          
          {/* Left Column: Photo & Contact */}
          <div className="md:w-5/12 flex flex-col items-center md:items-end w-full sticky top-24">
            {/* Photo container */}
            <div className="w-64 h-80 overflow-hidden rounded-sm mb-10 shadow-2xl rotate-[-1deg] hover:rotate-0 transition-transform duration-700 relative group">
              <img 
                src={data.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-200">
                          更换头像
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload}/>
                      </label>
                  </div>
              )}
            </div>
            
            {/* Info Block */}
            <div className="text-center md:text-right space-y-6 w-full max-w-sm">
              {isEditing ? (
                  <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="text-5xl font-black uppercase tracking-tight text-black text-center md:text-right w-full border-b border-black outline-none bg-transparent" />
              ) : (
                  <h2 className="text-5xl font-black uppercase tracking-tight text-black">{data.name}</h2>
              )}
              
              <div className="flex flex-col space-y-3 text-sm font-bold text-gray-500 md:items-end tracking-wide">
                  <div className="flex items-center justify-center md:justify-end w-full">
                      {isEditing ? <input value={data.university} onChange={e => setData({...data, university: e.target.value})} className="border-b text-right w-full" placeholder="学校" /> : <span>{data.university}</span>}
                  </div>
                  <div className="flex items-center justify-center md:justify-end w-full">
                      {isEditing ? <input value={data.major} onChange={e => setData({...data, major: e.target.value})} className="border-b text-right w-full" placeholder="专业" /> : <span>{data.major}</span>}
                  </div>
                   <div className="flex items-center justify-center md:justify-end w-full">
                      {isEditing ? <input value={data.location} onChange={e => setData({...data, location: e.target.value})} className="border-b text-right w-full" placeholder="位置" /> : <span>{data.location}</span>}
                  </div>
                  
                  {/* Conditional Render for Email: Only show if editing OR if email is not empty */}
                  {(isEditing || data.email) && (
                    <div className="flex items-center justify-center md:justify-end w-full">
                        {isEditing ? (
                            <input 
                                value={data.email} 
                                onChange={e => setData({...data, email: e.target.value})} 
                                className="border-b text-right w-full" 
                                placeholder="邮箱 (留空隐藏)" 
                            />
                        ) : (
                            <a href={`mailto:${data.email}`} className="hover:text-black hover:underline">{data.email}</a>
                        )}
                    </div>
                  )}
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
                {isEditing ? (
                    <textarea 
                        value={data.intro} 
                        onChange={e => setData({...data, intro: e.target.value})} 
                        className="w-full h-64 p-4 bg-gray-50 border rounded-xl resize-none outline-none focus:ring-2 focus:ring-black"
                    />
                ) : (
                    <p className="whitespace-pre-wrap">{data.intro}</p>
                )}
              </div>
            </section>

            <section>
               <h3 className="text-xs font-bold uppercase text-gray-400 mb-8 tracking-[0.2em] flex items-center justify-between">
                   <span>成果与荣誉 <span className="h-px bg-gray-100 w-12 ml-4 inline-block"></span></span>
                   {isEditing && <button onClick={addAward} className="text-green-600 text-xs hover:underline">+ 添加奖项</button>}
               </h3>
               <ul className="space-y-10">
                  {data.awards.map((award, idx) => (
                      <li key={idx} className="flex items-start group relative">
                          {isEditing && (
                              <button onClick={() => removeAward(idx)} className="absolute -left-8 top-1 text-red-500 hover:text-red-700 font-bold">×</button>
                          )}
                          <span className="text-gray-200 font-black text-4xl mr-8 group-hover:text-black transition-colors -mt-2">
                              {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1">
                              {isEditing ? (
                                  <div className="space-y-2">
                                      <input value={award.title} onChange={e => handleAwardChange(idx, 'title', e.target.value)} className="w-full font-bold border-b" placeholder="奖项名称" />
                                      <div className="flex gap-2">
                                         <input value={award.year} onChange={e => handleAwardChange(idx, 'year', e.target.value)} className="w-20 text-sm border-b" placeholder="年份" />
                                         <input value={award.desc} onChange={e => handleAwardChange(idx, 'desc', e.target.value)} className="flex-1 text-sm border-b" placeholder="描述" />
                                      </div>
                                  </div>
                              ) : (
                                <>
                                    <h4 className="text-2xl font-bold">{award.title}</h4>
                                    <p className="text-gray-500 font-medium mt-2">{award.year} · {award.desc}</p>
                                </>
                              )}
                          </div>
                      </li>
                  ))}
               </ul>
            </section>

             <section>
               <h3 className="text-xs font-bold uppercase text-gray-400 mb-8 tracking-[0.2em] flex items-center">
                   技能栈 <span className="h-px bg-gray-100 w-12 ml-4"></span>
               </h3>
               {isEditing ? (
                   <div>
                       <textarea 
                            value={data.skills.join(', ')} 
                            onChange={e => setData({...data, skills: e.target.value.split(',').map(s => s.trim())})}
                            className="w-full p-4 bg-gray-50 border rounded-xl"
                            placeholder="用逗号分隔技能..."
                       />
                       <p className="text-xs text-gray-400 mt-2">使用逗号分隔不同技能</p>
                   </div>
               ) : (
                    <div className="flex flex-wrap gap-4">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="px-6 py-3 bg-white font-bold text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-colors cursor-default shadow-sm">
                                {skill}
                            </span>
                        ))}
                    </div>
               )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;