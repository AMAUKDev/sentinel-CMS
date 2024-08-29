import React from 'react';
import axios from 'axios';

/**
 * Functional component to control the running Flask apps.
 * @param {Object} app_info - Information about the Flask apps.
 * @returns {JSX.Element} - App control UI.
 */
const AppControl = React.memo(({ app_info }) => {
  /**
   * Function to send control command to a Flask app.
   * @param {string} name - Name of the Flask app.
   * @param {string} action - Action to perform (restart or shutdown).
   */
  const sendControlCommand = (name, action) => {
    axios.post(`/control/${name}/${action}/`, app_info)
      .then(response => {
        if (response.status === 200) {
          alert(`${name} ${action}ed successfully`);
        } else {
          alert(`Failed to ${action} ${name}`);
        }
      })
      .catch(error => console.error('Error sending control command:', error));
  };

  return (
    <div>
      <h1>Running Flask Apps</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Port</th>
            <th>Actions</th>
          </tr>
        </thead>
          <tbody>
            {Object.keys(app_info.NAME || {}).map(key => (
              <tr key={key}>
                <td>{app_info.NAME[key]}</td>
                <td>{app_info.ADDRESS[key] || '127.0.0.1'}</td>
                <td>{app_info.PORT[key]}</td>
                <td>
                  <button onClick={() => sendControlCommand(app_info.NAME[key], 'restart')}>Restart</button>
                  <button onClick={() => sendControlCommand(app_info.NAME[key], 'shutdown')}>Shutdown</button>
                </td>
              </tr>
            ))}
          </tbody>
      </table>
    </div>
  );
});

/**
 * Functional component to display information about running Flask apps.
 * @param {Object} props - Props passed to the component.
 * @param {string} props.pageId - Unique identifier for the page.
 * @param {Object} props.pageData - Data for the page.
 * @param {Function} props.interpretationCallback - Callback function for interpretation.
 * @returns {JSX.Element} - Component UI.
 */
const AppInfoHostPage = React.memo(({ pageId, pageData, interpretationCallback }) => {
    return (
        <div className={pageData['page_type']} key={pageId} id={pageId}>
            {/*<h5>{pageData.title}</h5>*/}
            <div className="mb-4">{pageData.description}</div>
            <AppControl app_info={pageData.app_info}/> {/* Include the AppControl component here */}
        </div>
    );
});

export default AppInfoHostPage;
