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
        <option value="">Select who you wanna talk with</option>
        <option value="New Friend">New Friend</option>
        <option value="Partner">Partner</option>
        <option value="Daily Conversation partner">Daily conversation</option>
        <option value="Host family">Host Family</option>
        <option value="Tour Guide">Tour Guide</option>
        <option value="Cultural Exchange partner">Cultural Exchange</option>
      </Form.Control>
    </Form.Group>
  );
}

export default TopicSelection;
