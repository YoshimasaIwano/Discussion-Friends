// hooks/DiscussionContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { firebase, firestore } from "../firebase/firebase";
export type Chat = {
  role: string;
  content: string;
};

export type ChatSummary = {
  topic: string;
  datetime: string;
  summaryText: string;
};

type DiscussionContextType = {
  language: string;
  topic: string;
  level: string;
  chatHistory: Chat[];
  discussions: ChatSummary[];
  setLanguage: (topic: string) => void;
  setTopic: (topic: string) => void;
  setLevel: (level: string) => void;
  setChatHistory: (chatHistory: Chat[]) => void;
  setDiscussions: (discussions: ChatSummary[]) => void;
};

const DiscussionContext = createContext<DiscussionContextType>({
  language: "",
  topic: "",
  level: "",
  chatHistory: [],
  discussions: [],
  setLanguage: () => {},
  setTopic: () => {},
  setLevel: () => {},
  setChatHistory: () => {},
  setDiscussions: () => {},
});

export const useDiscussion = () => useContext(DiscussionContext);

interface DiscussionProviderProps {
  children: React.ReactNode;
}

export const DiscussionProvider: React.FC<DiscussionProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState("en");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [discussions, setDiscussions] = useState<ChatSummary[]>([]);
  const user = firebase.auth().currentUser;
  useEffect(() => {
    fetchDiscussions();
  }, [user]);

  const fetchDiscussions = async () => {
    if (!user?.uid) {
      return;
    }

    const userRef = firestore.collection("users").doc(user.uid);

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
        chatHistory,
        discussions,
        setLanguage,
        setTopic,
        setLevel,
        setChatHistory,
        setDiscussions,
      }}
    >
      {children}
    </DiscussionContext.Provider>
  );
};
