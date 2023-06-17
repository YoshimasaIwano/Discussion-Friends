import { Col, Form } from 'react-bootstrap';

interface LanguageSelectionProps {
  language: string;
  setLanguage: (language: string) => void;
}

// LanguageSelection.tsx
function LanguageSelection({ language, setLanguage }: LanguageSelectionProps) {
  return (
    <Form.Group as={Col} className="px-ns-0" controlId="language">
      <Form.Label>Language</Form.Label>
      <Form.Control
        as="select"
        value={language}
        className="text-center text-small "
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="ja">Japanese</option>
        <option value="es">Spanish</option>
        <option value="zh">Chinese</option>
        {/* // Add more options here */}
      </Form.Control>
    </Form.Group>
  );
}

export default LanguageSelection;
