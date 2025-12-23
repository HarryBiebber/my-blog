export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
  imageUrl?: string;
}

export interface Album {
  id: string;
  title: string;
  location: string;
  date: string;
  coverUrl: string;
  description?: string;
  images: string[];
  likes: number; // New field
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  likes: number; // New field
}

export interface GuestbookEntry {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  replies: GuestbookReply[];
}

export interface GuestbookReply {
  id: string;
  author: string;
  content: string;
  date: string;
}

export enum ImageSize {
  Size1K = "1K",
  Size2K = "2K",
  Size4K = "4K"
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  sources?: Array<{uri: string, title: string}>;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}