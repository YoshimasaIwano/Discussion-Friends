import React, { useEffect, useRef, useState } from "react";
import { Chat, useDiscussion } from "../hooks/DiscussionContext";
import { firebase, firestore } from "../firebase/firebase";

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
    content: "Today's weather is sunny with a high of 75°F and a low of 55°F.",
  },
];

function Discussion() {
  const { language, topic, level, chatHistory, setChatHistory } =
    useDiscussion();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [transcribedText, setTranscribedText] = useState("");
  const [responseText, setResponseText] = useState("");
  const audioChunks: Blob[] = useRef([]).current;
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    if (transcribedText) {
      sendChatData();
      setTranscribedText("");
    }
  }, [chatHistory]);

  useEffect(() => {
    if (responseText) {
      speakText();
    }
  }, [responseText]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.addEventListener("dataavailable", (event: BlobEvent) => {
      audioChunks.push(event.data);
    });

    // recorder.addEventListener("stop", () => {});

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
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");
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
      console.log("Audio data sent successfully:", whisperText);
      setTranscribedText(whisperText);
      setChatHistory([{ role: "user", content: whisperText }]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
    console.log("Chat data sent successfully:", responseText);
    setResponseText(responseText);
    setChatHistory([{ role: "assistant", content: responseText }]);
  };

  const speakText = async () => {
    setIsSpeaking(true);
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    console.log("Speaking text:", responseText);
    const text = responseText;
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
}

export default Discussion;

// import React, { useEffect, useRef, useState } from "react";
// import { Chat, useDiscussion } from "../hooks/DiscussionContext";
// import { firebase, firestore } from "../firebase/firebase";

// function Discussion() {
//   const { language, topic, level, chatHistory, setChatHistory } =
//     useDiscussion();
//   const [recording, setRecording] = useState(false);
//   const [isAgent, setIsAgent] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
//     null
//   );
//   const [audioURL, setAudioURL] = useState<string>("");
//   const audioChunks: Blob[] = useRef([]).current;
//   const currentUser = firebase.auth().currentUser;

//   useEffect(() => {
//     if (isAgent) {
//       agentPerform();
//       setIsAgent(false);
//     }
//   }, [chatHistory]);

//   useEffect(() => {
//     if (audioURL) {
//       console.log("Audio URL in useEffect:", audioURL);
//       transcribing();
//       setIsAgent(true);
//     }
//   }, [audioURL]);

//   const handleStartRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);

//     recorder.addEventListener("dataavailable", (event: BlobEvent) => {
//       audioChunks.push(event.data);
//     });

//     // recorder.addEventListener("stop", () => {

//     // });

//     setMediaRecorder(recorder);
//     recorder.start();
//     setRecording(true);
//   };

//   const handleStopRecording = async () => {
//     if (mediaRecorder) {
//       mediaRecorder.stop();
//       setRecording(false);
//       const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//       const url = URL.createObjectURL(audioBlob);
//       console.log("Audio URL:", url);
//       const update_url = url.replace("blob:", "");
//       setAudioURL(update_url);
//     }
//   };

//   // const handleStopRecording = () => {
//   //   if (mediaRecorder) {
//   //     mediaRecorder.stop();
//   //     setRecording(false);
//   //     mediaRecorder.addEventListener("stop", async () => {
//   //       const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//   //       const audioURL = await sendAudioFile(audioBlob);
//   //       console.log("Audio URL:", audioURL);
//   //       const transcribedText = await transcribeAudio(audioURL);
//   //       setChatHistory([{ role: "user", content: transcribedText }]);
//   //       setIsAgent(true);
//   //     });
//   //   }
//   // };

//   // const sendAudioFile = async (audioBlob: Blob) => {
//   //   const formData = new FormData();
//   //   formData.append("audio", audioBlob, "audio.wav");

//   //   // const audioResponse = await fetch("/audio", {
//   //   //   method: "POST",
//   //   //   body: formData,
//   //   // });

//   //   // if (!audioResponse.ok) {
//   //   //   throw new Error(
//   //   //     `Error: ${audioResponse.status} ${audioResponse.statusText}`
//   //   //   );
//   //   // }

//   //   // const audioData = await audioResponse.json();
//   //   // console.log("Audio file sent successfully:", audioData);
//   //   // return audioData.audioURL;
//   // };

//   const transcribing = async () => {
//     // const transcribedText = await transcribeAudio(audioURL);
//     const transcribedText = await transcribeAudio(
//       "https://storage.googleapis.com/treasure-385205.appspot.com/audio/audio.wav"
//     );
//     console.log("Transcribed text:", transcribedText);
//     setChatHistory([{ role: "user", content: transcribedText }]);
//   }

//   const transcribeAudio = async (audioURL: string | void) => {
//     console.log("Audio URL in transcribeAudio:", audioURL);
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
//     return responseData.content;
//   };

//   const agentPerform = async () => {
//     const agentResponse = await discussChatAgent();
//     speakText(agentResponse);
//   }
//   const discussChatAgent = async () => {
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
//     return chatData.conversation[chatData.conversation.length - 1].content;
//   };

//   const speakText = async (chatResponse: string) => {
//     const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
//     const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

//     const data = {
//       input: {
//         chatResponse,
//       },
//       voice: {
//         languageCode: "en-US",
//         name: "en-US-Wavenet-A",
//       },
//       audioConfig: {
//         audioEncoding: "MP3",
//       },
//     };
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
//   };

//   const addToFirestore = async (user: firebase.User, responseData: string) => {
//     const userRef = firestore.collection("users").doc(user.uid);

//     // Get current discussions
//     const snapshot = await userRef.get();
//     const userData = snapshot.data();
//     const currentDiscussions = userData?.discussion ?? [];

//     const chatSummary = {
//       topic,
//       datetime: new Date().toISOString(),
//       responseData,
//     };

//     // Update the discussions array
//     await userRef.update({
//       discussion: [...currentDiscussions, chatSummary],
//     });

//     console.log("Chat history added to Firestore");
//   };

//   const sendSummary = async () => {
//     try {
//       // // Create a new chat summary
//       // const tmpChatHistory = [
//       //   {
//       //     role: "user",
//       //     content: "Hello, how are you?",
//       //   },
//       //   {
//       //     role: "assistant",
//       //     content: "Hi! I'm doing great, thank you. How can I help you today?",
//       //   },
//       //   {
//       //     role: "user",
//       //     content: "What's the weather like today?",
//       //   },
//       //   {
//       //     role: "assistant",
//       //     content:
//       //       "Today's weather is sunny with a high of 75°F and a low of 55°F.",
//       //   },
//       // ];
//       const response = await fetch("/summary", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           chatHistory,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status} ${response.statusText}`);
//       }

//       const responseData = await response.json();
//       if (currentUser) {
//         await addToFirestore(currentUser, responseData);
//       }

//       console.log("Summary sent successfully");
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <div>
//       <div>
//         <h1>Audio Recorder</h1>
//         <button onClick={handleStartRecording} disabled={recording}>
//           Start Talking
//         </button>
//         <button onClick={handleStopRecording} disabled={!recording}>
//           Stop Talking
//         </button>
//       </div>
//       <div>
//         <h1>Chat History</h1>
//         <ul>
//           {chatHistory.map((chat, index) => (
//             <li key={index}>
//               {chat.role}: {chat.content}
//             </li>
//           ))}
//         </ul>
//         <button onClick={sendSummary}>Finish</button>
//       </div>
//     </div>
//   );
// }

// export default Discussion;
