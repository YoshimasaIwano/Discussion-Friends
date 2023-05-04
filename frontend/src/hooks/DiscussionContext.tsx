// hooks/DiscussionContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { firestore } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContent";
import { Chat, ChatSummary, DiscussionContextType } from "../types";

const DiscussionContext = createContext<DiscussionContextType>({
  language: "",
  topic: "",
  level: "",
  speakingRate: 1.0,
  chatHistory: [],
  discussions: [],
  setLanguage: () => {},
  setTopic: () => {},
  setLevel: () => {},
  setSpeakingRate: ()=> {},
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
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [discussions, setDiscussions] = useState<ChatSummary[]>([]);
  const { user } = useAuth();
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
        speakingRate,
        chatHistory,
        discussions,
        setLanguage,
        setTopic,
        setLevel,
        setSpeakingRate,
        setChatHistory,
        setDiscussions,
      }}
    >
      {children}
    </DiscussionContext.Provider>
  );
};
