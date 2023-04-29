import React, { useRef, useState } from "react";
import { useDiscussion } from "../hooks/DiscussionContext";
import { firestore } from "../firebase/firebase";

type Chat = {
  role: string;
  content: string;
};

function Discussion () {
  const { language, topic, level } = useDiscussion();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunks: Blob[] = useRef([]).current;
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);


  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.addEventListener("dataavailable", (event: BlobEvent) => {
      audioChunks.push(event.data);
    });

    recorder.addEventListener("stop", () => {
    });

    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
  };

  const sendAudioData = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");

      const response = await fetch("/whisper", {
        method: "POST",
        body: JSON.stringify({
          audio: formData,
          language,
          topic,
          level,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Audio data sent successfully:", responseData);
      const transcribedText = responseData.transcribedText;

      // Call chat API and update chat history
      const chatResponse = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: transcribedText,
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

      const chatData = await chatResponse.json();
      setChatHistory((prevHistory) => [
        ...prevHistory,
        ...chatData.conversation,
      ]);

      // Speak the response from chat
      const responseText =
        chatData.conversation[chatData.conversation.length - 1].content;
      await speakText(responseText);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        await sendAudioData(audioBlob);
      });
    }
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const data = {
      input: {
        text,
      },
      voice: {
        languageCode: "en-US",
        name: "en-US-Wavenet-A",
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

  const addToFirestore = async () => {
    const userId = "<YOUR_USER_ID>"; // Replace with the actual user ID
    const userRef = firestore.collection("users").doc(userId);

    // Get current discussions
    const snapshot = await userRef.get();
    const userData = snapshot.data();
    const currentDiscussions = userData?.discussion ?? [];

    // Create a new chat summary
    const chatSummary = {
      topic,
      datetime: new Date().toISOString(),
      chatHistory,
    };

    // Update the discussions array
    await userRef.update({
      discussion: [...currentDiscussions, chatSummary],
    });

    console.log("Chat history added to Firestore");
  };

  const sendSummary = async () => {
    try {
      const response = await fetch("/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      await addToFirestore();

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
        <h1>Chat History</h1>
        <ul>
          {chatHistory.map((chat, index) => (
            <li key={index}>
              {chat.role}: {chat.content}
            </li>
          ))}
        </ul>
        <button onClick={sendSummary}>Finish</button>
      </div>
    </div>
  );
};

export default Discussion;
