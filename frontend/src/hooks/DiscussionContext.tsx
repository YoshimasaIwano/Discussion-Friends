// hooks/DiscussionContext.tsx
import { createContext, useContext, useState } from "react";

type DiscussionContextType = {
  topic: string;
  level: string;
  setTopic: (topic: string) => void;
  setLevel: (level: string) => void;
};

const DiscussionContext = createContext<DiscussionContextType>({
  topic: "",
  level: "",
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
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");

  return (
    <DiscussionContext.Provider value={{ topic, level, setTopic, setLevel }}>
      {children}
    </DiscussionContext.Provider>
  );
};
