// hooks/DiscussionContext.tsx
import { createContext, useContext, useState } from "react";
export type Chat = {
  role: string;
  content: string;
};

type DiscussionContextType = {
  language: string;
  topic: string;
  level: string;
  chatHistory: Chat[];
  setLanguage: (topic: string) => void;
  setTopic: (topic: string) => void;
  setLevel: (level: string) => void;
  setChatHistory: (chatHistory: Chat[]) => void;
};

const DiscussionContext = createContext<DiscussionContextType>({
  language: "",
  topic: "",
  level: "",
  chatHistory: [],
  setLanguage: () => {},
  setTopic: () => {},
  setLevel: () => {},
  setChatHistory: () => {},
});

export const useDiscussion = () => useContext(DiscussionContext);

interface DiscussionProviderProps {
  children: React.ReactNode;
}

export const DiscussionProvider: React.FC<DiscussionProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);

  return (
    <DiscussionContext.Provider
      value={{
        language,
        topic,
        level,
        chatHistory,
        setLanguage,
        setTopic,
        setLevel,
        setChatHistory,
      }}
    >
      {children}
    </DiscussionContext.Provider>
  );
};
