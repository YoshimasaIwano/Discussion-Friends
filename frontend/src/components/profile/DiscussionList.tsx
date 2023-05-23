import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { DiscussionSummary } from "../../types";
import { sum } from "../../functions/utils";

interface DiscussionListProps {
  discussions: DiscussionSummary[];
  handleDiscussionClick: (discussion: DiscussionSummary) => void;
}

const DiscussionList: React.FC<DiscussionListProps> = ({
  discussions,
  handleDiscussionClick,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  return (
    <Row xs={1} md={2} className="g-4 my-0 mx-0">
      {discussions
        .slice()
        .reverse()
        .map((discussion, index) => (
          <Col className="px-1 my-0" key={index}>
            <Card
              className="my-1 cursor-pointer card-discussion card-background"
              onClick={() => handleDiscussionClick(discussion)}
            >
              <Card.Body className="px-1 text-center">
                <Card.Title className="text-capitalize font-weight-bold discussion-title">
                  {discussion.topic}
                </Card.Title>
                <Card.Subtitle className="mb-2 ">
                  {formatDate(discussion.datetime)}
                </Card.Subtitle>
                <div className="d-flex ">
                  <Card.Text className="mx-auto">
                    <strong>Level:</strong> {discussion.level}
                  </Card.Text>
                  <Card.Text className="mx-auto">
                    <strong>Language:</strong> {discussion.language}
                  </Card.Text>
                  <Card.Text className="mx-auto">
                    <strong>Score:</strong> {sum(discussion.score)}
                  </Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
    </Row>
  );
};

export default DiscussionList;
