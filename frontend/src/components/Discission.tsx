import React, { useEffect, useRef, useState } from "react";
import { useDiscussion } from "../hooks/DiscussionContext";
import { firebase, firestore } from "../firebase/firebase";

type Chat = {
  role: string;
  content: string;
};

function Discussion() {
  const { language, topic, level, chatHistory, setChatHistory } =
    useDiscussion();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunks: Blob[] = useRef([]).current;
  const currentUser = firebase.auth().currentUser;
  const [audioSent, setAudioSent] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [whisperSent, setWhisperSent] = useState(false);
  const [chatResponseReceived, setChatResponseReceived] = useState(false);

  const resetStates = () => {
    setAudioSent(false);
    setWhisperSent(false);
    setChatResponseReceived(false);
  };


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

  const sendAudioData = async (audioBlob: Blob) => {
    // ...
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
    const audioURL = audioData.audioURL;
    setAudioURL(audioURL);
    // ...
    setAudioSent(true);
  };

  const sendWhisper = async () => {
    // ...
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
    const responseData = await response.json();
    console.log("Audio data sent successfully:", responseData);
    const transcribedText = responseData.transcribedText;
    setChatHistory(transcribedText);
    // ...
    setWhisperSent(true);
  };

  

  const sendChat = async () => {
    // ...
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

    const chatData = await chatResponse.json();
    setChatHistory(chatData.conversation);
    // ...
    // Speak the response from chat
    const responseText =
      chatData.conversation[chatData.conversation.length - 1].content;
    await speakText(responseText);
    setChatResponseReceived(true);
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

  useEffect(() => {
    if (audioSent && !whisperSent) {
      sendWhisper();
    }

    if (whisperSent && !chatResponseReceived) {
      sendChat();
    }

    if (chatResponseReceived && !isSpeaking) {
      const responseText = chatHistory[chatHistory.length - 1].content;
      speakText(responseText);
      resetStates();
    }
  }, [
    audioSent,
    whisperSent,
    chatResponseReceived,
    isSpeaking,
    chatHistory,
    sendWhisper,
    sendChat,
    speakText,
  ]);


  // const sendAudioData = async (audioBlob: Blob) => {
  //   try {
  //     // First, send the audio file
  //     const formData = new FormData();
  //     formData.append("audio", audioBlob, "audio.wav");

  //     const audioResponse = await fetch("/audio", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!audioResponse.ok) {
  //       throw new Error(
  //         `Error: ${audioResponse.status} ${audioResponse.statusText}`
  //       );
  //     }

  //     const audioData = await audioResponse.json();
  //     console.log("Audio file sent successfully:", audioData);
  //     const audioURL = audioData.audioURL;

  //     // Then, send the audio URL and other information
  //     const response = await fetch("/whisper", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         audioURL,
  //         language,
  //         topic,
  //         level,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status} ${response.statusText}`);
  //     }

  //     const responseData = await response.json();
  //     console.log("Audio data sent successfully:", responseData);
  //     const transcribedText = responseData.transcribedText;
  //     setChatHistory(transcribedText);

  //     // Call chat API and update chat history
  //     const chatResponse = await fetch("/chat", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         text: chatHistory,
  //         language,
  //         topic,
  //         level,
  //       }),
  //     });

  //     if (!chatResponse.ok) {
  //       throw new Error(
  //         `Error: ${chatResponse.status} ${chatResponse.statusText}`
  //       );
  //     }

  //     const chatData = await chatResponse.json();
  //     setChatHistory(chatData.conversation);

  //     // Speak the response from chat
  //     const responseText =
  //       chatData.conversation[chatData.conversation.length - 1].content;
  //     await speakText(responseText);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  // const speakText = async (text: string) => {
  //   setIsSpeaking(true);
  //   const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  //   const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  //   const data = {
  //     input: {
  //       text,
  //     },
  //     voice: {
  //       languageCode: "en-US",
  //       name: "en-US-Wavenet-A",
  //     },
  //     audioConfig: {
  //       audioEncoding: "MP3",
  //     },
  //   };

  //   try {
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status} ${response.statusText}`);
  //     }

  //     const responseData = await response.json();
  //     const audioContent = responseData.audioContent;
  //     const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
  //     audio.play();
  //   } catch (error) {
  //     console.error("Error:", error);
  //   } finally {
  //     setIsSpeaking(false);
  //   }
  // };

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
          data: tmpChatHistory,
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
    <div className="discussion-wrapper">
      <div>
        <h1 className="audio-recorder">Audio Recorder</h1>
        <button onClick={handleStartRecording} disabled={recording} className="audio-start-btn">
          Start Talking
        </button>
        <button onClick={handleStopRecording} disabled={!recording} className="audio-stop-btn">
          Stop
        </button>
      </div>
      <div>
        <ul>
          {chatHistory.map((chat, index) => (
            <li key={index}>
              {chat.role}: {chat.content}
            </li>
          ))}
        </ul>
        <button onClick={sendSummary} className="finish-discussion-btn">Finish Discussion</button>
      </div>
    </div>
  );
}

export default Discussion;
