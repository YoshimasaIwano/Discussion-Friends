import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDiscussion } from "../hooks/DiscussionContext";
import { firestore } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContent";
import { languageDictionary } from "../types";
import { Button, Container, Row, Col, Modal, Form } from "react-bootstrap";

function Discussion() {
  const {
    language,
    topic,
    level,
    chatHistory,
    speakingRate,
    setChatHistory,
    setDiscussions,
    setSpeakingRate,
  } = useDiscussion();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunks = useRef<Blob[]>([]);
  const { user } = useAuth();
  const [transcribedText, setTranscribedText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [sending, setSending] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const navigate = useNavigate();

  const goToHomePage = () => {
    setShowSummary(false);
    navigate("/");
  };

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

      // console.log("Chat history added to Firestore");
    }
  };

  const sendSummary = async () => {
    setSending(true);
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
      const receivedSummaryText = await summaryResponse.json();
      setSummaryText(receivedSummaryText);
      setShowSummary(true);

      if (user) {
        await addToFirestore(receivedSummaryText);
      }

      // console.log("Summary sent successfully");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSending(false);
    }
  };

  const parseSummaryText = (text: string) => {
    const mainPointsMatch = text.match(/Main points:\s(.*?)Conclusion:/s);
    const conclusionMatch = text.match(/Conclusion:\s(.*?)Feedback:/s);
    const feedbackMatch = text.match(/Feedback:\s(.*?)(?=\s[a-zA-Z]+:|\s*$)/s);

    const mainPoints = mainPointsMatch ? mainPointsMatch[1] : "none";
    const conclusion = conclusionMatch ? conclusionMatch[1] : "none";
    const feedback = feedbackMatch ? feedbackMatch[1] : "none";

    return { mainPoints, conclusion, feedback };
  };

  return (
    <Container className="vh-100">
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={8} lg={6}>
          <div className="d-flex justify-content-center mb-3">
            <Button
              onClick={handleStartRecording}
              disabled={recording}
              className="me-2 rounded-circle record-button mx-auto"
            >
              START
            </Button>
            <Button
              onClick={handleStopRecording}
              disabled={!recording}
              variant="danger"
              className="rounded-circle record-button mx-auto"
            >
              STOP
            </Button>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col xs={12} md={8} lg={6}>
          <Row className="gx-3 text-center ">
            <Col xs={12} sm={4}>
              <div>
                <strong>Language:</strong>
              </div>
              <h2 className="capitalize-bold">{language}</h2>
            </Col>
            <Col xs={12} sm={4}>
              <div>
                <strong>Topic:</strong>
              </div>
              <h2 className="capitalize-bold">{topic}</h2>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group controlId="speakingRate">
                <Form.Label>Speed</Form.Label>
                <Form.Control
                  type="range"
                  min="0.25"
                  max="4.0"
                  step="0.01"
                  value={speakingRate}
                  onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                />
                <p>{speakingRate.toFixed(2)}</p>
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col xs={12} md={8} lg={6}>
          <div>
            <h1>Transcription</h1>
            <div>
              {chatHistory.length > 1 && (
                <div className="mb-3">
                  <span>{chatHistory[chatHistory.length - 1].content}</span>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col xs={12} md={8} lg={6}>
          <div className="d-flex justify-content-center">
            <Button onClick={sendSummary} variant="success">
              Finish
            </Button>
          </div>
        </Col>
      </Row>
      <Modal
        show={showSummary}
        onHide={() => setShowSummary(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Body>
            {(() => {
              const { mainPoints, conclusion, feedback } =
                parseSummaryText(summaryText);
              return (
                <>
                  <h5 className="text-capitalize font-weight-bold">
                    Main Points
                  </h5>
                  <p>{mainPoints}</p>
                  <h5 className="text-capitalize font-weight-bold">
                    Conclusion
                  </h5>
                  <p>{conclusion}</p>
                  <h5 className="text-capitalize font-weight-bold">Feedback</h5>
                  <p>{feedback}</p>
                </>
              );
            })()}
          </Modal.Body>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-center">
            <Button variant="secondary" onClick={goToHomePage}>
              Home
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Modal show={sending} backdrop="static" keyboard={false} centered>
        <Modal.Body className="text-center">Sending summary...</Modal.Body>
      </Modal>
    </Container>
  );
}

export default Discussion;
