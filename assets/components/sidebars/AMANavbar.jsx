import React from 'react';
import { Container, Button, Image } from 'react-bootstrap';
import { CaretRightFill, CaretLeftFill } from 'react-bootstrap-icons';
import { useDarkMode } from '../../context/DarkModeContext'; // Import the useDarkMode hook
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import getCSRFToken from '../../common/csrftoken';

const AMANavbar = React.memo(({ displayName, userGroupTags, selectionAreaOpen, setSelectionAreaOpen }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode(); // Use the useDarkMode hook

  const handleToggleSelectionArea = () => {
    setSelectionAreaOpen(!selectionAreaOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/logout/', {}, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
      });

      // Redirect to the Django-served login page
      window.location.href = '/login/';

    } catch (error) {
      console.error('Error logging out:', error);
      // Handle the error appropriately in your application
    }
  }

  return (
    <Container fluid className='p-0 dashboard-content'>
      <Container className='sidebar-content p-0 align-items-center'>
        <ul className='nav-item-list p-0'>
          <div className='mt-3'>
            <li>
              <Image
                id='logo'
                className='mx-auto'
                src={'../../../static/images/logo.png'}
                alt="Logo"
              />
            </li>
          </div>
          <div fluid className='d-flex justify-content-center mx-2'>
            <li className='my-4'>
              <Button
                variant={isDarkMode ? 'outline-light' : 'outline-secondary'}
                id='toggle-interpretation-button'
                onClick={handleToggleSelectionArea}
                aria-controls="example-collapse-text"
                aria-expanded={selectionAreaOpen}
              >
                Toggle Information Selection {selectionAreaOpen ? <CaretLeftFill /> : <CaretRightFill/>}
              </Button>
            </li>
          </div>
          {userGroupTags.includes('AMAUK') && (
            <div fluid className='d-flex justify-content-center'>
              <li className='mt-0 mb-3'>
                <Button
                  variant={isDarkMode ? 'outline-light' : 'outline-secondary'}
                  id='ama-tools-button'>
                  AMA Tools
                </Button>
              </li>
            </div>
          )}
          <div fluid className='d-flex justify-content-center mx-2'>
            <li className='mt-0 mb-3'>
              <a
                href="/change-password/"  // Specify the absolute URL path here
                className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Account Management
              </a>
            </li>
          </div>
          <div className="mt-auto">
            <div className='d-flex justify-content-center mb-3'>
              <li className='mt-0'>
                <Button
                  variant={isDarkMode ? 'outline-light' : 'outline-secondary'} // Change variant based on dark mode
                  id='dark-mode-button'
                  onClick={toggleDarkMode}
                  className='dark-mode-button'
                >
                  <FontAwesomeIcon
                    icon={isDarkMode ? faSun : faMoon}
                    className={`dark-mode-icon ${isDarkMode ? 'sun' : 'moon'}`}
                  />
                </Button>
              </li>
            </div>
            <div className='profile-icon d-flex justify-content-center'>
              <Image id='login-icon' src={'../../../static/images/user.png'} alt="Person"/>
            </div>
            <div className="d-flex justify-content-center">
              <p className="mx-1 my-0 text-wrap">{displayName}</p>
            </div>

          </div>
          <div className='mx-auto d-flex justify-content-center'>
            <li>
              <Button
                variant="outline-danger"
                className="mb-1"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </li>
          </div>
        </ul>
      </Container>
    </Container>
  );
});

export default AMANavbar;
