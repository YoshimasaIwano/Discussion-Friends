import { Button } from 'react-bootstrap';

interface StartStopButtonsProps {
  recording: boolean;
  isReadyToStart: boolean;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
}

const StartStopButtons = ({
  recording,
  isReadyToStart,
  handleStartRecording,
  handleStopRecording,
}: StartStopButtonsProps) => {
  return (
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
  );
};

export default StartStopButtons;
