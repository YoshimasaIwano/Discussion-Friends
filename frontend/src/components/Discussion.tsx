import { useEffect, useRef, useState } from "react";
import { useDiscussion } from "../hooks/DiscussionContext";
import { firebase, firestore } from "../firebase/firebase";

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
const languageDictionary: Record<string, languageInfo> = {
  en: English,
  ja: Japanese,
  es: Spanish,
  zh: Chinese,
};

function Discussion() {
  const { language, topic, level, chatHistory, discussions, setChatHistory, setDiscussions } =
    useDiscussion();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [transcribedText, setTranscribedText] = useState("");
  const [responseText, setResponseText] = useState("");
  const audioChunks = useRef<Blob[]>([]);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    setChatHistory([
      {
        role: "system",
        content: `You are going to have a debate with ${level}'s the user in ${languageDictionary[language].language}. 
      Your topic is about ${topic}. Take a side and start an argument with the user. 
      The purpose of this conversation is to improve the user's logical and critical thinking. 
      After having 15 conversation with the user, end the conversation. 
      Remember, the purpose of this conversation is to improve the user's logical thinking and critical thinking.`,
      },
    ]);
  }, [language, topic, level]);

  useEffect(() => {
    if (transcribedText) {
      const sendChatData = async () => {
        // Call chat API and update chat history
        const chatResponse = await fetch("/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: chatHistory,
            language,
            topic,
            level,
          }),
        });

        if (!chatResponse.ok) {
          throw new Error(
            `Error: ${chatResponse.status} ${chatResponse.statusText}`
          );
        }

        const responseText = await chatResponse.json();
        // console.log("Chat data sent successfully:", responseText);
        setResponseText(responseText);
        setChatHistory([
          ...chatHistory,
          { role: "assistant", content: responseText },
        ]);
      };
      sendChatData();
      setTranscribedText("");
    }
  }, [chatHistory]);

  useEffect(() => {
    if (responseText) {
      const speakText = async () => {
        setIsSpeaking(true);
        const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

        // console.log("Speaking text:", responseText);
        const text = responseText;
        const data = {
          input: {
            text,
          },
          voice: {
            languageCode: languageDictionary[language].languageCode,
            name: languageDictionary[language].name,
          },
          audioConfig: {
            audioEncoding: "MP3",
          },
        };

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const responseData = await response.json();
          const audioContent = responseData.audioContent;
          const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
          audio.play();
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setIsSpeaking(false);
        }
      };
      speakText();
    }
  }, [language, responseText]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    audioChunks.current = [];

    recorder.addEventListener("dataavailable", (event: BlobEvent) => {
      audioChunks.current.push(event.data);
    });

    recorder.addEventListener("stop", () => {});

    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
        await sendAudioData(audioBlob);
      });
    }
  };

  const sendAudioData = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.mp3");
      formData.append("language", language);
      formData.append("topic", topic);
      formData.append("level", level);

      const response = await fetch("/whisper", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const whisperText = await response.json();
      // console.log("Audio data sent successfully:", whisperText);
      setTranscribedText(whisperText);
      setChatHistory([...chatHistory, { role: "user", content: whisperText }]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addToFirestore = async (user: firebase.User, summaryText: string) => {
    const userRef = firestore.collection("users").doc(user.uid);

    // Get current discussions
    const snapshot = await userRef.get();
    const userData = snapshot.data();
    const currentDiscussions = userData?.discussion ?? [];

    // Create a new chat summary
    const chatSummary = {
      topic,
      datetime: new Date().toISOString(),
      summaryText,
    };

    // Update the discussions array
    await userRef.update({
      discussion: [...currentDiscussions, chatSummary],
    });

    setDiscussions([...currentDiscussions, chatSummary]);

    console.log("Chat history added to Firestore");
  };

  const sendSummary = async () => {
    try {
      const summaryResponse = await fetch("/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: chatHistory,
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error(
          `Error: ${summaryResponse.status} ${summaryResponse.statusText}`
        );
      }
      const summaryText = await summaryResponse.json();
      if (currentUser) {
        await addToFirestore(currentUser, summaryText);
      }

      console.log("Summary sent successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div>
        <h1>Audio Recorder</h1>
        <button onClick={handleStartRecording} disabled={recording}>
          Start Talking
        </button>
        <button onClick={handleStopRecording} disabled={!recording}>
          Stop Talking
        </button>
      </div>
      <div>
        <button onClick={sendSummary}>Finish</button>
      </div>
    </div>
  );
}

export default Discussion;
