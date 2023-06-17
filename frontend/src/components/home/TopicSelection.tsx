import { Col, Form } from 'react-bootstrap';

interface TopicSelectionProps {
  topic: string;
  setTopic: (topic: string) => void;
}

// TopicSelection.tsx
function TopicSelection({ topic, setTopic }: TopicSelectionProps) {
  return (
    <Form.Group as={Col} className="px-ns-0" controlId="topic">
      <Form.Label>Topic</Form.Label>
      <Form.Control
        as="select"
        value={topic}
        className={`text-center text-small ${topic ? '' : 'text-danger'}`}
        onChange={(e) => setTopic(e.target.value)}
      >
        <option value="">Select a topic</option>
        <option value="technology">Technology</option>
        <option value="science">Science</option>
        <option value="sports">Sports</option>
        <option value="business">Business</option>
        <option value="health">Health</option>
        <option value="education">Education</option>
        <option value="politics">Politics</option>
        <option value="entertainment">Entertainment</option>
        <option value="history">History</option>
      </Form.Control>
    </Form.Group>
  );
}

export default TopicSelection;
