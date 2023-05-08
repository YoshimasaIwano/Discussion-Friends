type languageInfo = {
  language: string;
  languageCode: string;
  name: string;
};

const English: languageInfo = {
  language: "English",
  languageCode: "en-US",
  name: "en-US-Wavenet-A",
};
const Japanese: languageInfo = {
  language: "Japanese",
  languageCode: "ja-JP",
  name: "ja-JP-Wavenet-A",
};

const Spanish: languageInfo = {
  language: "Spanish",
  languageCode: "es-ES",
  name: "es-ES-Wavenet-B",
};

const Chinese: languageInfo = {
  language: "Chinese",
  languageCode: "cmn-CN",
  name: "cmn-CN-Wavenet-A",
};
export const languageDictionary: Record<string, languageInfo> = {
  en: English,
  ja: Japanese,
  es: Spanish,
  zh: Chinese,
};

export type Chat = {
  role: string;
  content: string;
};

export type ChatSummary = {
  topic: string;
  datetime: string;
  mainPoints: string;
  conclusion: string;
  feedback: string;
  score: number;
};

export type DiscussionContextType = {
  language: string;
  topic: string;
  level: string;
  speakingRate: number;
  chatHistory: Chat[];
  discussions: ChatSummary[];
  darkMode: boolean;
  setLanguage: (topic: string) => void;
  setTopic: (topic: string) => void;
  setLevel: (level: string) => void;
  setSpeakingRate: (rate: number) => void;
  setChatHistory: (chatHistory: Chat[]) => void;
  setDiscussions: (discussions: ChatSummary[]) => void;
  toggleDarkMode: (event: React.MouseEvent) => void;
};
