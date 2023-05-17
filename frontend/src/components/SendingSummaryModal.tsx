import React from "react";
import { Modal } from "react-bootstrap";

const SendingSummaryModal = () => {
  return (
    <Modal show={true} backdrop="static" keyboard={false} centered>
      <Modal.Body className="d-flex justify-content-center align-items-center">
        <p className="mr-2 mb-0">Sending summary...</p>
        <span className="spinner"></span>
      </Modal.Body>
    </Modal>
  );
};

export default SendingSummaryModal;
