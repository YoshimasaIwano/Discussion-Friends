import { useEffect, useState } from 'react';
import { useDiscussion } from '../../hooks/DiscussionContext';
import { firestore } from '../../firebase/firebase';
import { useAuth } from '../../firebase/AuthContent';
import { languageDictionary, DiscussionSummary } from '../../types';
import { Container, Row, Col } from 'react-bootstrap';
import RecordRTC from 'recordrtc';
import SummaryModal from './SummaryModal';
import LimitModal from './LimitModal';
import FinishButton from './FinishButton';
import StartStopButton from './StartStopButton';
import ChatTranscription from './ChatTranscription';
import DiscussionConfig from './DiscussionDonfig';

function Discussion() {
  const { language, topic, level, chatHistory, speakingRate, setChatHistory } =
    useDiscussion();
  const [recording, setRecording] = useState(false);
  const [recordRTC, setRecordRTC] = useState<RecordRTC | null>(null);
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

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
      });

      recorder.startRecording();
      setRecordRTC(recorder);
      setRecording(true);
    });
  };


  const handleStopRecording = () => {
    if (recordRTC) {
      recordRTC.stopRecording(async () => {
        const audioBlob = recordRTC.getBlob();
        await sendAudioData(audioBlob);
        recordRTC.reset(); // This releases the stream
        setRecordRTC(null);
        setRecording(false);
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
      <DiscussionConfig />
      <Row className="justify-content-center mt-3">
        <Col xs={12} md={8} lg={6}>
          <StartStopButton
            recording={recording}
            isReadyToStart={isReadyToStart}
            handleStartRecording={handleStartRecording}
            handleStopRecording={handleStopRecording}
          />
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col xs={12} md={8} lg={6}>
          <ChatTranscription />
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
