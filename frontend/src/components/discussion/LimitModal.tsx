import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface LimitModalProps {
  setShowLimitReached: React.Dispatch<React.SetStateAction<boolean>>;
}

const LimitModal: React.FC<LimitModalProps> = ({ setShowLimitReached }) => {
  const navigate = useNavigate();

  const goToHomePage = () => {
    setShowLimitReached(false);
    navigate('/');
  };
  return (
    <Modal
      show={true}
      backdrop="static"
      keyboard={false}
      onHide={() => setShowLimitReached(false)}
      centered
    >
      <Modal.Header>
        <Modal.Title>Limit Reached</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        You have reached the limit of 5 discussions per month. Please wait until
        next month to start a new discussion.
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-center">
          <Button variant="secondary" onClick={goToHomePage}>
            Home
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default LimitModal;
