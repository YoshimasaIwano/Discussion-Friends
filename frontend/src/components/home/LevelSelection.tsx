import { Col, Form } from 'react-bootstrap';

interface LevelSelectionProps {
  level: string;
  setLevel: (level: string) => void;
}

// LevelSelection.tsx
function LevelSelection({ level, setLevel }: LevelSelectionProps) {
  return (
    <Form.Group as={Col} className="px-ns-0" controlId="level">
      <Form.Label>Level</Form.Label>
      <Form.Control
        as="select"
        value={level}
        className={`text-center text-small ${level ? '' : 'text-danger'}`}
        onChange={(e) => setLevel(e.target.value)}
      >
        <option value="" className="text-red">
          Select a level
        </option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </Form.Control>
    </Form.Group>
  );
}

export default LevelSelection;
