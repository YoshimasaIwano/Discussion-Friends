import React, { useRef, useState } from "react";
import { useDiscussion } from "../hooks/DiscussionContext";
import { firebase, firestore } from "../firebase/firebase";

type Chat = {
  role: string;
  content: string;
};

function Discussion () {
  const { language, topic, level, chatHistory, setChatHistory } =
    useDiscussion();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunks: Blob[] = useRef([]).current;
  const currentUser = firebase.auth().currentUser;

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.addEventListener("dataavailable", (event: BlobEvent) => {
      audioChunks.push(event.data);
    });

    recorder.addEventListener("stop", () => {});

    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
  };

  const sendAudioData = async (audioBlob: Blob) => {
    try {
      // First, send the audio file
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");

      const audioResponse = await fetch("/audio", {
        method: "POST",
        body: formData,
      });

      if (!audioResponse.ok) {
        throw new Error(
          `Error: ${audioResponse.status} ${audioResponse.statusText}`
        );
      }

      const audioData = await audioResponse.json();
      console.log("Audio file sent successfully:", audioData);
      const audioURL = audioData.audioURL;

      // Then, send the audio URL and other information
      const response = await fetch("/whisper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioURL,
          language,
          topic,
          level,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // ... (rest of the code remains the same)
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

  const addToFirestore = async (user: firebase.User, responseData: string) => {
    const userRef = firestore.collection("users").doc(user.uid);

    // Get current discussions
    const snapshot = await userRef.get();
    const userData = snapshot.data();
    const currentDiscussions = userData?.discussion ?? [];

    const chatSummary = {
      topic,
      datetime: new Date().toISOString(),
      responseData,
    };

    // Update the discussions array
    await userRef.update({
      discussion: [...currentDiscussions, chatSummary],
    });

    console.log("Chat history added to Firestore");
  };

  const sendSummary = async () => {
    try {
      // Create a new chat summary
      const tmpChatHistory = [
        {
          role: "user",
          content: "Hello, how are you?",
        },
        {
          role: "assistant",
          content: "Hi! I'm doing great, thank you. How can I help you today?",
        },
        {
          role: "user",
          content: "What's the weather like today?",
        },
        {
          role: "assistant",
          content:
            "Today's weather is sunny with a high of 75°F and a low of 55°F.",
        },
      ];
      const response = await fetch("/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tmpChatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      if (currentUser) {
        await addToFirestore(currentUser, responseData);
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
