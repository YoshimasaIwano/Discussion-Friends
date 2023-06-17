import { Col, Form } from 'react-bootstrap';

interface SpeedSelectionProps {
  speakingRate: number;
  setSpeakingRate: (speakingRate: number) => void;
}

// SpeedSelection.tsx
function SpeedSelection({
  speakingRate,
  setSpeakingRate,
}: SpeedSelectionProps) {
  return (
    <Form.Group as={Col} className="px-ns-0" controlId="speakingRate">
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
  );
}

export default SpeedSelection;
