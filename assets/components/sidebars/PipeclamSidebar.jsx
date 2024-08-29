import React from "react";
import DeviceList from "../pipeclam/DeviceList";

/**
 * Sidebar component for displaying Pipeclam devices.
 * @param {Object} props - Props passed to the component.
 * @param {Object} props.map - The map object.
 * @param {Object} props.devices - Object containing information about Pipeclam devices.
 * @returns {JSX.Element} - PipeclamSidebar component.
 */
function PipeclamSidebar({ map, devices }) {
  return (
    <div className="pipeclam-sidebar">
      <h5 className="px-2">Active Trackers</h5>
      {map && devices && Object.keys(devices).length > 0 && (
        <DeviceList map={map} devices={devices} />
      )}
    </div>
  );
}

export default PipeclamSidebar;
