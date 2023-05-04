import { useEffect, useRef, useState } from "react";
import { useDiscussion } from "../hooks/DiscussionContext";
import { firestore } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContent";
import { languageDictionary } from "../types";
import { Button, Container, Row, Col, Card } from "react-bootstrap";

function Discussion() {
  const {
    language,
    topic,
    level,
    chatHistory,
    speakingRate, 
    setChatHistory,
    setDiscussions,
  } = useDiscussion();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [transcribedText, setTranscribedText] = useState("");
  const [responseText, setResponseText] = useState("");
  const audioChunks = useRef<Blob[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    setChatHistory([
      {
        role: "system",
        content: `You are going to have a debate with ${level}'s the user in ${languageDictionary[language].language}. 
      Your topic is about ${topic}. Take a side and start an argument with the user. 
      The purpose of this conversation is to improve the user's logical and critical thinking. 
      Respond as short as possible. 
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
            speakingRate: speakingRate,
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
        }
      };
      speakText();
    }
  }, [responseText]);

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

  const addToFirestore = async (summaryText: string) => {
    if (user) {
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
    }
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
      if (user) {
        await addToFirestore(summaryText);
      }

      console.log("Summary sent successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const buttonStyles = {
    borderRadius: "50%",
    padding: "1rem 1.5rem",
    fontSize: "1.1rem",
    width: "50%",
    margin: "0 auto",
  };


  return (
    <Container fluid="md">
      <Row className="mt-5 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card>
            <Card.Body className="text-center">
              <Card.Title>Audio Recorder</Card.Title>
              <div className="d-flex justify-content-around">
                <Button
                  variant="primary"
                  onClick={handleStartRecording}
                  disabled={recording}
                  style={buttonStyles}
                >
                  Start Talking
                </Button>
                <Button
                  variant="danger"
                  onClick={handleStopRecording}
                  disabled={!recording}
                  style={buttonStyles}
                >
                  Stop Talking
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-5 justify-content-center">
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Card.Body className="text-center">
              <Card.Title>Chat</Card.Title>
              <Card.Text>
                {chatHistory.length > 1 && (
                  <span>{chatHistory[chatHistory.length - 1].content}</span>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-5 justify-content-center">
        <Col xs={12} sm={8} md={6} className="text-center">
          <Button variant="success" onClick={sendSummary}>
            Finish
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Discussion;
