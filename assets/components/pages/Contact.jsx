import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

/**
 * Component for rendering a single contact item.
 * @param {Object} props - Props passed to the component.
 * @param {string} props.title - The title of the contact item.
 * @param {string} props.email - The email address for the contact.
 * @returns {JSX.Element} - ContactItem component.
 */
const ContactItem = ({ title, email }) => (
  <Row className="mb-4 contact-text">
    <Col>
      <h4 className="mb-2" aria-label={`Contact ${title}`}>{title}</h4>
      <p>
        For {title.toLowerCase()} enquiries, please contact{' '}
        <a href={`mailto:${email}`} aria-label={`Email ${title}`}>{email}</a>.
      </p>
    </Col>
  </Row>
);

/**
 * Component for rendering contact information.
 * @returns {JSX.Element} - ContactInfo component.
 */
function ContactInfo() {
  return (
    <Container fluid className="mt-0 contact-container">
      {/* Line above contact info */}
      <hr className="mt-0" />

      <h2 className="mb-4 p-1 contact-info">Contact Info</h2>

      {/* Render contact items */}
      <ContactItem title="General" email="AMAUK@andrew-moore.com" />
      <ContactItem title="Platform" email="zak.hodgson@andrew-moore.com" />
      <ContactItem title="Hardware" email="bryn.jones@andrew-moore.com" />
    </Container>
  );
}

export default ContactInfo;
