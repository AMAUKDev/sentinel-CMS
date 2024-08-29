import React from 'react';
import { Row, Tabs, Tab, Container } from 'react-bootstrap';
import Contact from './Contact';
import { useDarkMode } from '../../context/DarkModeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

/**
 * Main content area component for rendering tabs and contact information.
 * @param {Object} props - Props passed to the component.
 * @param {Object[]} props.tabs - Array of tab objects.
 * @param {string} props.activeTab - ID of the active tab.
 * @param {Function} props.setActiveTab - Function to set the active tab.
 * @param {Function} props.setTabs - Function to set the tabs.
 * @returns {JSX.Element} Main content area component.
 */
function MainContentArea({ tabs, activeTab, setActiveTab, setTabs }) {
  const { isDarkMode } = useDarkMode();
  return (
    <Container fluid className='p-0' data-bs-theme={isDarkMode ? "dark" : "light"}>
      <Row>
        <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key)}>
          {tabs.map((tab) => (
            <Tab

              id={tab.jobId}
              eventKey={tab.jobId}
              // title={tab.data.tab_name}
              title={
                <div>
                  <span className='tab-name'>{tab.data.tab_name}</span>
                  <FontAwesomeIcon 
                    className={`close-icon ${isDarkMode ? 'text-light' : 'text-dark'}`}
                    icon={faX}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTabs((prevTabs) => prevTabs.filter((t) => t.jobId !== tab.jobId)) 
                    }}
                    aria-label="Close Tab"
                  />
                </div>
              }
              aria-label={`Tab: ${tab.data.tab_name}`}
              key={tab.jobId}
            >
              {tab.handler ? tab.handler(tab.data) : null}
            </Tab>
          ))}
        </Tabs>
      </Row>
    
      <Container fluid className='p-0'>
        <Contact />
      </Container>
    </Container>
  );
}

export default MainContentArea;
