import React from "react";
import { Modal } from "react-bootstrap";

const SendingSummaryModal = () => {
  return (
    <Modal show={true} backdrop="static" keyboard={false} centered>
      <Modal.Body className="">
        <p className="mx-auto">Sending summary...</p>
        <span className="spinner mx-auto"></span>
      </Modal.Body>
    </Modal>
  );
};

export default SendingSummaryModal;
