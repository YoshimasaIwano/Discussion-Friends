// hooks/DiscussionContext.tsx
import { createContext, useContext, useState } from "react";

type DiscussionContextType = {
  language: string;
  topic: string;
  level: string;
  setLanguage: (topic: string) => void;
  setTopic: (topic: string) => void;
  setLevel: (level: string) => void;
};

const DiscussionContext = createContext<DiscussionContextType>({
  language: "",
  topic: "",
  level: "",
  setLanguage: () => {},
  setTopic: () => {},
  setLevel: () => {},
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

  return (
    <DiscussionContext.Provider
      value={{ language, topic, level, setLanguage, setTopic, setLevel }}
    >
      {children}
    </DiscussionContext.Provider>
  );
};
