import React from 'react';
import isEqual from 'lodash/isEqual';
import { Container } from 'react-bootstrap';
import Overview from '../../cms lite/turbines/Overview';


/**
 * Functional component to render the summary page for CMS Lite.
 * @param {Object} props - Props passed to the component.
 * @param {string} props.pageId - Unique identifier for the page.
 * @param {Object} props.pageData - Data for the page.
 * @param {Function} props.interpretationCallback - Callback function for interpretation.
 * @returns {JSX.Element} - Summary page UI.
 */
const CMSLiteSummaryPage = React.memo(({ pageId, pageData, interpretationCallback }) => {
  console.log("CMSLiteSummaryPage received data: ", pageData);

  /**
   * Callback function for page data.
   * @param {Object} data - Data received for the page.
   */
  // function pageCallback(data) {
  //   console.log("CMSLiteSummaryPageCallback", data);
  // }

  return (
    <Container fluid className={pageData['page_type']} key={pageId} id={pageId}>
      {pageData.description && <p>{pageData.description}</p>}
      <Overview data={JSON.parse(pageData.data_json)} highLevelPaths={pageData.suitable_node_paths_by_high_level_node_path} />
      {/* {Object.entries(pageData.sections).map(([sectionKey, section]) => (
        <div key={pageId + "_" + sectionKey} id={pageId + "_" + sectionKey}>
          {section.title && <h6>{section.title}</h6>}
          {section.description && <p>{section.description}</p>}
          <div className="d-flex flex-wrap" key={pageId + "_" + sectionKey + "_widgets"} id={pageId + "_" + sectionKey + "_widgets"} style={{ maxWidth: '100%' }}>
            {section.widgets.map((widgetConfig, widgetIndex) => (
              <WidgetRenderer
                widgetKey={pageId + "_" + sectionKey + "_" + widgetIndex}
                widgetConfig={widgetConfig}
                pageCallback={pageCallback}
                key={widgetIndex} // Added key prop for unique identification
              />
            ))}
          </div>
        </div>
      ))} */}
    </Container>
  );
}, (prevProps, nextProps) => {
  return isEqual(prevProps.pageData, nextProps.pageData);
});

export default CMSLiteSummaryPage;
