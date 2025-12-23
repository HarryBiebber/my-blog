import { BlogPost, Album } from '../types';

// We will use Albums for both Campus and World for consistency in the Mock
export const campusAlbums: Album[] = [
  {
    id: 'c1',
    title: '微电影《青春》拍摄',
    location: '南门大草坪',
    date: '2024.04.10',
    coverUrl: 'https://picsum.photos/seed/movie/800/800',
    description: '大学生电影节参赛作品，担任导演与剪辑。连续熬夜三天的成果。',
    likes: 24,
    images: [
        'https://picsum.photos/seed/mov1/1920/1080',
        'https://picsum.photos/seed/mov2/1920/1080',
        'https://picsum.photos/seed/mov3/1920/1080',
    ]
  },
  {
    id: 'c2',
    title: '秋日运动会',
    location: '北校区体育场',
    date: '2023.10.15',
    coverUrl: 'https://picsum.photos/seed/sports/800/800',
    description: '挥洒汗水的午后，记录 4x100 接力的精彩瞬间。',
    likes: 18,
    images: [
        'https://picsum.photos/seed/run1/800/600',
        'https://picsum.photos/seed/run2/800/1200',
        'https://picsum.photos/seed/run3/800/800',
    ]
  },
  {
    id: 'c3',
    title: '社团音乐节',
    location: '学生活动中心',
    date: '2023.12.24',
    coverUrl: 'https://picsum.photos/seed/music/800/800',
    description: '吉他社的圣诞专场演出。',
    likes: 45,
    images: [
        'https://picsum.photos/seed/mus1/800/600',
        'https://picsum.photos/seed/mus2/800/800',
    ]
  }
];

export const adventureAlbums: Album[] = [
  {
    id: 'w1',
    title: '寻找富士山',
    location: '日本 · 河口湖',
    date: '2023.08.10',
    coverUrl: 'https://picsum.photos/seed/fuji/800/1000',
    description: '在云层散开的那一刻，看到了完美的锥形山体。',
    likes: 102,
    images: [
        'https://picsum.photos/seed/fuji1/800/1200',
        'https://picsum.photos/seed/fuji2/800/600',
        'https://picsum.photos/seed/fuji3/800/800',
    ]
  },
  {
    id: 'w2',
    title: '大漠孤烟',
    location: '中国 · 敦煌',
    date: '2022.10.05',
    coverUrl: 'https://picsum.photos/seed/desert/800/1000',
    description: '骑着骆驼穿越鸣沙山，感受千年的苍茫。',
    likes: 88,
    images: [
        'https://picsum.photos/seed/des1/800/1200',
        'https://picsum.photos/seed/des2/800/800',
    ]
  }
];

export const blogPosts: BlogPost[] = [];