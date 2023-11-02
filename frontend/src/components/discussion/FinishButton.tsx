import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { DiscussionSummary, languageDictionary } from '../../types';
import { useDiscussion } from '../../hooks/useDiscussionContext';
// import { firestore } from '../../firebase/firebase';
// import { useAuth } from '../../firebase/AuthContent';
import SendingSummaryModal from './SendingSummaryModal';

interface FinishButtonProps {
  isReadyToFinish: boolean;
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
  setSummaryContent: React.Dispatch<
    React.SetStateAction<DiscussionSummary | undefined>
  >;
}

const FinishButton: React.FC<FinishButtonProps> = ({
  isReadyToFinish,
  setShowSummary,
  setSummaryContent,
}) => {
  const { language, topic, level, chatHistory } =
    useDiscussion();
  // const { user } = useAuth();
  const [sending, setSending] = useState(false);
  // const addToFirestore = async (summaryData: DiscussionSummary) => {
    // if (user) {
    //   const userRef = firestore.collection('users').doc(user.uid);

    //   // Get current discussions
    //   const snapshot = await userRef.get();
    //   const userData = snapshot.data();
    //   const currentDiscussions = userData?.discussion ?? [];

    //   // Update the discussions array
    //   await userRef.update({
    //     discussion: [...currentDiscussions, summaryData],
    //   });

  //     setDiscussions([...currentDiscussions, summaryData]);
  //   // }
  // };

  const sendSummary = async () => {
    setSending(true);
    try {
      const summaryResponse = await fetch('/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory,
          language: languageDictionary[language].language,
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error(
          `Error: ${summaryResponse.status} ${summaryResponse.statusText}`,
        );
      }
      const receivedSummaryData = await summaryResponse.json();
      // Create a new chat summary
      const discussionSummary: DiscussionSummary = {
        topic: topic,
        level: level,
        language: languageDictionary[language].language,
        datetime: new Date().toISOString(),
        mainPoints: receivedSummaryData.mainPoints,
        conclusion: receivedSummaryData.conclusion,
        feedback: receivedSummaryData.feedback,
        score: receivedSummaryData.score,
      };
      setSummaryContent(discussionSummary);

      setShowSummary(true);

      // if (user) {
      //   await addToFirestore(discussionSummary);
      // }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };
  return (
    <>
      {sending ? (
        <SendingSummaryModal />
      ) : (
        <div className="d-flex justify-content-center">
          <Button
            onClick={sendSummary}
            variant="success"
            disabled={!isReadyToFinish}
          >
            Finish
          </Button>
        </div>
      )}
    </>
  );
};

export default FinishButton;
