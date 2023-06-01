import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { firestore } from '../firebase/firebase';
import { useAuth } from '../firebase/AuthContent';
import { Chat, DiscussionSummary, DiscussionContextType } from '../types';

const DiscussionContext = createContext<DiscussionContextType>({
  language: '',
  topic: '',
  level: '',
  speakingRate: 1.0,
  chatHistory: [],
  discussions: [],
  darkMode: false,
  setLanguage: (_: string) => {
    _;
  },
  setTopic: (_: string) => {
    _;
  },
  setLevel: (_: string) => {
    _;
  },
  setSpeakingRate: (_: number) => {
    _;
  },
  setChatHistory: (_: Chat[]) => {
    _;
  },
  setDiscussions: (_: DiscussionSummary[]) => {
    _;
  },
  toggleDarkMode: (_) => {
    _;
  },
});

export const useDiscussion = () => useContext(DiscussionContext);

interface DiscussionProviderProps {
  children: React.ReactNode;
}

export const DiscussionProvider: React.FC<DiscussionProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState('en');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    fetchDiscussions();
  }, [user]);

  const toggleDarkMode = (event: React.MouseEvent) => {
    event.preventDefault();
    setDarkMode(!darkMode);
  };

  const fetchDiscussions = async () => {
    if (!user?.uid) {
      return;
    }

    const userRef = firestore.collection('users').doc(user.uid);

    const snapshot = await userRef.get();
    const userData = snapshot.data();
    const currentDiscussions = userData?.discussion ?? [];

    setDiscussions(currentDiscussions);
  };

  return (
    <DiscussionContext.Provider
      value={{
        language,
        topic,
        level,
        speakingRate,
        chatHistory,
        discussions,
        darkMode,
        setLanguage,
        setTopic,
        setLevel,
        setSpeakingRate,
        setChatHistory,
        setDiscussions,
        toggleDarkMode,
      }}
    >
      {children}
    </DiscussionContext.Provider>
  );
};
