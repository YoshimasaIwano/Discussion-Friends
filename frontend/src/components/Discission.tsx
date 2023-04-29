import React, { useRef, useState } from "react";
import { useDiscussion } from "../hooks/DiscussionContext";

const Discussion: React.FC = () => {
  const { topic, level } = useDiscussion();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioChunks: Blob[] = useRef([]).current;

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.addEventListener("dataavailable", (event: BlobEvent) => {
      audioChunks.push(event.data);
    });

    recorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
    });

    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const speak = async () => {
    setIsSpeaking(true);
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY; 
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const data = {
      input: {
        text: "Hello",
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
  
  return (
    <div>
      <button onClick={speak} disabled={isSpeaking}>
        {isSpeaking ? "Speaking..." : "Say Hello"}
      </button>
      <div>
        <h1>Audio Recorder</h1>
        <button onClick={handleStartRecording} disabled={recording}>
          Start Recording
        </button>
        <button onClick={handleStopRecording} disabled={!recording}>
          Stop Recording
        </button>
        {audioURL && (
          <div>
            <h3>Recorded Audio:</h3>
            <audio src={audioURL} controls />
          </div>
        )}
      </div>
    </div>
  );
};

export default Discussion;
