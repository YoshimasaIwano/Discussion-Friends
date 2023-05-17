import React from "react";
import { Modal, Button } from "react-bootstrap";

const LimitModal = ({ onHide, goToHomePage }: {onHide: () => void, goToHomePage: () => void}) => {
  return (
    <Modal
      show={true}
      backdrop="static"
      keyboard={false}
      onHide={onHide}
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
