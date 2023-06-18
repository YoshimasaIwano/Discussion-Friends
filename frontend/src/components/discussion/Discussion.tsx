import { useEffect, useRef, useState } from 'react';
import { useDiscussion } from '../../hooks/DiscussionContext';
import { firestore } from '../../firebase/firebase';
import { useAuth } from '../../firebase/AuthContent';
import { languageDictionary, DiscussionSummary } from '../../types';
import { Button, Container, Row, Col, Form, Card } from 'react-bootstrap';
import SummaryModal from './SummaryModal';
import LimitModal from './LimitModal';
import FinishButton from './FinishButton';

function Discussion() {
  const {
    language,
    topic,
    level,
    chatHistory,
    speakingRate,
    setChatHistory,
    setSpeakingRate,
  } = useDiscussion();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const audioChunks = useRef<Blob[]>([]);
  const [isReadyToFinish, setIsReadyToFinish] = useState(false);
  const [isReadyToStart, setIsReadyToStart] = useState(true);
  const { user } = useAuth();
  const [transcribedText, setTranscribedText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryContent, setSummaryContent] = useState<DiscussionSummary>();
  const [showLimitReached, setShowLimitReached] = useState(false);

  useEffect(() => {
    setChatHistory([
      {
        role: 'system',
        content: `You are going to have a conversation with ${level}'s the user in ${languageDictionary[language].language}.
        You are going to talk as if you are the user's ${topic}. 
        The purpose of this conversation is to improve the user's conversational English skills. Respond as short as possible.
        Remember, the purpose of this conversation is to improve the user's proficiency in conversational English skills. `,
      },
    ]);
  }, [language, topic, level]);

  useEffect(() => {
    if (transcribedText) {
      const sendChatData = async () => {
        // Call chat API and update chat history
        const chatResponse = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: chatHistory,
          }),
        });

        if (!chatResponse.ok) {
          throw new Error(
            `Error: ${chatResponse.status} ${chatResponse.statusText}`,
          );
        }

        const responseText = await chatResponse.json();
        // console.log("Chat data sent successfully:", responseText);
        setResponseText(responseText);
        setChatHistory([
          ...chatHistory,
          { role: 'assistant', content: responseText },
        ]);
      };
      sendChatData();
      setTranscribedText('');
    }
  }, [chatHistory]);

  useEffect(() => {
    if (responseText) {
      const speakText = async () => {
        setIsReadyToFinish(false);
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
            audioEncoding: 'MP3',
            speakingRate: speakingRate,
          },
        };

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const responseData = await response.json();
          const audioContent = responseData.audioContent;
          const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);

          // Add an event listener for the ended event to set isSpeaking to false
          audio.addEventListener('ended', () => {
            setIsReadyToFinish(true);
            setIsReadyToStart(true);
          });
          audio.play();
        } catch (error) {
          console.error('Error:', error);
        } 
      };
      speakText();
    }
  }, [responseText]);

  useEffect(() => {
    const fetchUserDiscussions = async () => {
      if (user) {
        const userRef = firestore.collection('users').doc(user.uid);

        // Get current discussions
        const snapshot = await userRef.get();
        const userData = snapshot.data();
        const currentDiscussions = userData?.discussion ?? [];

        return currentDiscussions;
      }
    };

    const checkDiscussionCount = async () => {
      if (user) {
        // Assuming you have a function to get the current user's discussions...
        const discussions = await fetchUserDiscussions();

        // Get the current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter the discussions for the current month
        const discussionsThisMonth = discussions.filter(
          (discussion: DiscussionSummary) => {
            const discussionDate = new Date(discussion.datetime);
            return (
              discussionDate.getMonth() === currentMonth &&
              discussionDate.getFullYear() === currentYear
            );
          },
        );

        // If the user has had 5 or more discussions this month, show a popup message
        if (discussionsThisMonth.length >= 5) {
          setShowLimitReached(true);
        }
      }
    };

    checkDiscussionCount();
  }, []);

  const handleStartRecording = async () => {
    // Set isSpeaking to true before playing the audio
    setIsReadyToFinish(false);
    setIsReadyToStart(false);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    audioChunks.current = [];

    recorder.addEventListener('dataavailable', (event: BlobEvent) => {
      audioChunks.current.push(event.data);
    });

    recorder.addEventListener('stop', (_) => {_});

    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
        await sendAudioData(audioBlob);
      });
    }
  };

  const sendAudioData = async (audioBlob: Blob) => {
    try {
      const userId = user?.uid;
      const formData = new FormData();
      formData.append('audio', audioBlob, `audio_${userId}.mp3`);
      formData.append('language', language);

      const response = await fetch('/whisper', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const whisperText = await response.json();
      // console.log("Audio data sent successfully:", whisperText);
      setTranscribedText(whisperText);
      setChatHistory([...chatHistory, { role: 'user', content: whisperText }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Container className="vh-100">
      <Row className="justify-content-center mt-5 ">
        <Col xs={12} md={8} lg={6}>
          <Row className="gx-3 text-center">
            <Col xs={12} sm={4} className="mx-auto">
              <div>
                <strong>Language:</strong>
              </div>
              <h3 className="capitalize-bold">
                {languageDictionary[language].language}
              </h3>
            </Col>
            <Col xs={12} sm={4} className="mx-auto">
              <div>
                <strong>Topic:</strong>
              </div>
              <h3 className="capitalize-bold">{topic}</h3>
            </Col>
            <Col xs={12} sm={4} className="mx-auto">
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
          <div className="d-flex justify-content-center mb-3">
            <Button
              onClick={handleStartRecording}
              disabled={recording || !isReadyToStart}
              className="me-2 rounded-circle record-button start-button mx-auto"
            >
              START
            </Button>
            <Button
              onClick={handleStopRecording}
              disabled={!recording}
              className="rounded-circle record-button stop-button mx-auto"
            >
              STOP
            </Button>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col xs={12} md={8} lg={6}>
          <Card bg="light">
            <Card.Header as="h5" className="text-center">
              Transcription
            </Card.Header>
            <Card.Body>
              {chatHistory.length > 1 ? (
                <div
                  className={`mb-3 ${chatHistory[chatHistory.length - 1].role}`}
                >
                  <span>{chatHistory[chatHistory.length - 1].content}</span>
                </div>
              ) : (
                <div className="mb-3 text-center">
                  <span>
                    Start to talk and you will see each transcription here
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col xs={12} md={8} lg={6}>
          <FinishButton
            isReadyToFinish={isReadyToFinish}
            setShowSummary={setShowSummary}
            setSummaryContent={setSummaryContent}
          />
        </Col>
      </Row>
      <SummaryModal
        show={showSummary}
        summaryContent={summaryContent}
        setShowSummary={setShowSummary}
      />

      {showLimitReached && (
        <LimitModal setShowLimitReached={setShowLimitReached} />
      )}
    </Container>
  );
}

export default Discussion;
