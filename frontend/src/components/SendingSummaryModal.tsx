import React from "react";
import { Modal } from "react-bootstrap";

const SendingModal = () => {
  return (
    <Modal show={true} backdrop="static" keyboard={false} centered>
      <Modal.Body className="">
        <p className="mx-auto">Sending summary...</p>
        <span className="spinner mx-auto"></span>
      </Modal.Body>
    </Modal>
  );
};

export default SendingModal;
