import React, { useCallback } from 'react';
import { Container, Tabs, Tab, Button } from 'react-bootstrap';
import isEqual from 'lodash/isEqual';
import CMSLiteSummaryPage from "../components/pages/interpretation pages/CMSLiteSummaryPage.jsx";
import AppInfoHostPage from "../components/pages/interpretation pages/AppInfoHostPage.jsx";
import { useDarkMode } from '../context/DarkModeContext.jsx';
import { useJobs } from "../context/JobContext.jsx";

/**
 * Checks if two sets of props are equal.
 * @param {Object} prevProps - The previous props.
 * @param {Object} nextProps - The next props.
 * @returns {boolean} - True if props are equal, false otherwise.
 */
const areEqual = (prevProps, nextProps) => {
  // Destructure job_id from both props and compare the rest
  const { data_in: prevDataIn, ...restPrevProps } = prevProps;
  const { data_in: nextDataIn, ...restNextProps } = nextProps;
  // Compare the rest of the props
  const propsEqual = isEqual(restPrevProps, restNextProps);

  // Compare data_in excluding job_id
  const { job_id: _, ...restPrevData } = prevDataIn;
  const { job_id: __, ...restNextData } = nextDataIn;
  const dataEqual = isEqual(restPrevData, restNextData);

  return propsEqual && dataEqual;
};

/**
 * Handles interpretation of data and renders appropriate pages.
 * @param {Object} props - Props passed to the component.
 * @param {Object} props.data - Input data for interpretation.
 * @returns {JSX.Element} - InterpretationHandler component.
 */
const InterpretationHandler = React.memo(({ data_in }) => {
  const { isDarkMode } = useDarkMode();
  const { initiateJob } = useJobs();

  /**
   * Callback function for interpretation actions.
   * @param {Object} callback_data - Data received from the interpretation action.
   */
  const interpretationCallback = useCallback((callback_data) => {
    if (callback_data.method === "refresh") {
      let kwargs_for_refresh = data_in.interpretation_kwargs;
      kwargs_for_refresh.job_id = data_in.job_id;

      if (callback_data.kwargs) {
        kwargs_for_refresh = { ...kwargs_for_refresh, ...callback_data.kwargs };
      }

      // Build the payload (as a method, it's called later to get the actual values).
      const createPayload = () => ({
        interpretation_key: kwargs_for_refresh.interpretation_key,
        node_ids: kwargs_for_refresh.node_ids,
        monitor_ids: kwargs_for_refresh.monitor_ids,
        entity_ids: kwargs_for_refresh.entity_ids,
        job_id: kwargs_for_refresh.job_id,
      });

      // Do the job!
      initiateJob({ createPayload });
    }
  }, [data_in, initiateJob]);

  /**
   * Handles the click event of the refresh button.
   * @param {Object} e - The event object.
   */
  const handleRefreshClick = useCallback((e) => {
    e.preventDefault();
    interpretationCallback({ method: "refresh" });
  }, [interpretationCallback]);

  /**
   * Determines which page component to render based on pageType.
   * @param {Object} props - Props passed to the component.
   * @param {string} props.pageId - The unique identifier for the page.
   * @param {string} props.pageType - The type of the page.
   * @param {Object} props.pageData - Data related to the page.
   * @returns {JSX.Element} - The appropriate page component.
   */
  const GetPageComponent = useCallback(({ pageId, pageType, pageData }) => {
    const sharedProps = {
      interpretationCallback, // Pass the callback to the widget
      pageId,
      pageData
    };

    switch (pageType) {
      case 'default_page':
        return <DefaultPage {...sharedProps} />;
        case 'cmslite_summary_page':
          sharedProps['pageData']['data_json'] = data['data_json'];
          sharedProps['pageData']['suitable_node_paths_by_high_level_node_path'] = data['suitable_node_paths_by_high_level_node_path'];
          return <CMSLiteSummaryPage {...sharedProps} />;
      case 'app_info_host_page':
        return <AppInfoHostPage {...sharedProps} />;
      default:
        return <div>{pageType} is an unknown page type</div>;
    }
  }, [interpretationCallback]);

  return (
    <Container fluid className='p-0'>
      {/* Refresh Button */}
      <Button variant={`outline-${isDarkMode ? "light" : "dark"}`} onClick={handleRefreshClick} style={{ float: 'right' }}>Refresh Interpretation</Button>
      <Tabs defaultActiveKey={Object.keys(data_in.pages)[0]} id="interpretation-tabs">
        {Object.entries(data_in.pages).map(([pageKey, page]) => (
          <Tab eventKey={pageKey} title={page.title} key={pageKey}>
            {/* Render the appropriate page component based on the page type */}
            <GetPageComponent pageId={`${data_in.job_id}_${pageKey}`} pageType={page.page_type} pageData={page} />
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
}, areEqual);

export default InterpretationHandler;
