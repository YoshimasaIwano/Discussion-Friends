import { Form } from 'react-bootstrap';

interface SpeechRateControlProps {
  speakingRate: number;
  setSpeakingRate: (speakingRate: number) => void;
}

const SpeechRateControl = ({
  speakingRate,
  setSpeakingRate,
}: SpeechRateControlProps) => {
  return (
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
  );
};

export default SpeechRateControl;
