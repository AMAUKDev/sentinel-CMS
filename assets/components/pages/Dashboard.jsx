/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Collapse } from 'react-bootstrap';
import axios from "axios";
import InterpretationHandler from '../../utils/InterpretationHandler';
import { toggleMainSidebarIcons } from '../../common/toggleBurger';
import AMANavbar from '../sidebars/AMANavbar';
import MainContentArea from "./MainContentArea";
import SelectionArea from './SelectionArea';
import { useJobs } from '../../context/JobContext';
import { useDarkMode } from '../../context/DarkModeContext';


/**
 * Dashboard component.
 * @returns {JSX.Element} Dashboard component.
 */
const Dashboard = React.memo(() => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [defaultDisplayed, setDefaultDisplayed] = useState(false);
  const [selectionAreaOpen, setSelectionAreaOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [userGroupTags, setUserGroupTags] = useState([]);
  const [userInterestTags, setUserInterestTags] = useState([]);
  const [dashboardSetDefaultCallbackBool, setDashboardSetDefaultCallbackBool] = useState(false);
  const { isDarkMode } = useDarkMode();
  const { setDataHandler } = useJobs();
  const interpretationHandlerRef = useRef(null);
  const setDataHandlerRef = useRef(setDataHandler);

  /**
   * Handles the received data for tabs, updating the state with new tabs or updating existing ones.
   * @param {Object} data - The data received for a tab.
   * @param {Function} dataHandler - A function to handle the data for a tab.
   */
  const defaultHandleReceivedDataInTabs = useCallback((data, dataHandler = () => null) => {
    const jobId = data.job_id;
    // we still need to check if a tab already exists with that jobId before we make another one

    setTabs(prevTabs => {
      let tabExists = false;
      const updatedTabs = prevTabs.map(tab => {
        // Refreshing tabs
        if (tab.jobId === jobId) {
          tabExists = true;
          // Only update the data property of the existing tab
          return { ...tab, data };
        }
        return tab;
      });

      // If the tab with the given jobId does not exist, add it as a new tab
      if (!tabExists) {
        updatedTabs.push({ jobId, data, handler: dataHandler });
      }

      return updatedTabs;
    });

    setActiveTab(jobId);
  }, []);

  const defaultHandleReceivedDataInTabsRef = useRef(defaultHandleReceivedDataInTabs);

  useEffect(() => {
    defaultHandleReceivedDataInTabsRef.current = defaultHandleReceivedDataInTabs;
    // Now use defaultHandleReceivedDataInTabsRef.current wherever you need to call the function
  }, [defaultHandleReceivedDataInTabs]);


  // Ref assignment for interpretation handler
  interpretationHandlerRef.current = (data) => {
    return <InterpretationHandler data_in={data}  />;
  };

  /**
   * Toggles the visibility of the sidebar, including updating the UI to reflect the change.
   */
  const toggleSideBar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    toggleMainSidebarIcons();

    document.getElementById("main-dashboard-burger").classList.toggle("closed");
    document.getElementById("main-dashboard-burger").classList.toggle("open");
  };


  useEffect(() => {

    // Fetch user data on component mount
    (async () => {
      try{
        const response = await axios.get('/api/logged_in_user/');
        
        let data = await response.data[0];

        if (response.status === 200) {
          setDataHandlerRef.current(data => {
            // Assuming interpretationHandlerRef.current is correctly capturing the latest interpretationHandler function
            defaultHandleReceivedDataInTabsRef.current(data, interpretationHandlerRef.current);
          });

          setDisplayName(data.email);
          // For group tags
          const uniqueGroupTags = [...new Set(data.group_tags.map(tag => tag.name))];
          setUserGroupTags(uniqueGroupTags);

          // For interest tags
          const uniqueInterestTags = [...new Set(data.interest_tags.map(tag => tag.name))];
          setUserInterestTags(uniqueInterestTags);
        }
      }
      catch (error) {
        console.log(error);
      }
      setDashboardSetDefaultCallbackBool(true);
    })();
  }, []);


  return (
      <div className='dashboard-wrapper'>
        {/* Sidebar */}
        <div className={`dashboard-sidebar-wrapper ${isSidebarOpen ? 'open' : 'closed'} ${isDarkMode ? 'dark' : ''}`}>
          {/* Sidebar toggle menu button */}
          <div id="main-dashboard-burger" className={`main-dashboard ${isSidebarOpen ? 'open' : 'closed'}`} onClick={toggleSideBar} aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
            <div className={`burger-bar-1 ${isDarkMode ? 'dark' : ''}`} id="main-x-1"></div>
            <div className={`burger-bar-2 ${isDarkMode ? 'dark' : ''}`} id="main-x-2"></div>
            <div className={`burger-bar-3 ${isDarkMode ? 'dark' : ''}`} id="main-x-3"></div>
          </div>

          {/* Sidebar content */}
          {isSidebarOpen && (<AMANavbar
              displayName={displayName}
              userGroupTags={userGroupTags}
              setSelectionAreaOpen={setSelectionAreaOpen}
              selectionAreaOpen={selectionAreaOpen}
          />)}
        </div>

        {/* Page Content */}
        <div className={`page-content ${isSidebarOpen ? 'open' : 'closed'}`}>
          <Collapse in={selectionAreaOpen}>
            <div>
              { dashboardSetDefaultCallbackBool &&
                <SelectionArea
                  defaultDisplayed={defaultDisplayed}
                  setDefaultDisplayed={setDefaultDisplayed}
                  dashboardSetDefaultCallbackBool={dashboardSetDefaultCallbackBool}
                />
              }
            </div>
          </Collapse>
          <MainContentArea
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setTabs={setTabs}
          />
        </div>
      </div>
  );
});

export default Dashboard;
