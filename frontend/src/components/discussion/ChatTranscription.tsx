import { Card } from 'react-bootstrap';
import { useDiscussion } from '../../hooks/useDiscussionContext';

const ChatTranscription = () => {
  const { chatHistory } = useDiscussion();
  return (
    <Card bg="light">
      <Card.Header as="h5" className="text-center">
        Transcription
      </Card.Header>
      <Card.Body>
        {chatHistory.length > 1 ? (
          <div className={`mb-3 ${chatHistory[chatHistory.length - 1].role}`}>
            <span>{chatHistory[chatHistory.length - 1].content}</span>
          </div>
        ) : (
          <div className="mb-3 text-center">
            <span>Start to talk and you will see each transcription here</span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChatTranscription;
