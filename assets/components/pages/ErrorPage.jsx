// ErrorPage.jsx
import React from 'react';
import { Container } from 'react-bootstrap';

/**
 * Error page component for displaying 404 Not Found error.
 * @returns {JSX.Element} Error page component.
 */
function ErrorPage() {
  return (
    <Container>
      <h2>404 - Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
    </Container>
  );
};

export default ErrorPage;
