import React, { useState, useEffect } from 'react';
import Dropdown from './Dropdown';
import AlarmBox from './AlarmBox';
import InfoBox from './InfoBox';
import MapBox from "./MapBox";
import Timeline from "./Timeline";
import AlarmsContainer from "./AlarmsContainer";

/**
 * Component responsible for rendering different types of widgets based on their configuration.
 * @param {Object} props - Props passed to the component.
 * @param {string} props.widgetKey - Key identifying the widget.
 * @param {Object} props.widgetConfig - Configuration object for the widget.
 * @param {Function} props.pageCallback - Callback function for page actions.
 * @returns {JSX.Element|null} - Rendered widget component or null if widget is not visible.
 */
const WidgetRenderer = React.memo(({ widgetKey, widgetConfig, pageCallback }) => {
  const [visibleWidgets, setVisibleWidgets] = useState({ [widgetKey]: true });

  useEffect(() => {
    setVisibleWidgets((prevWidgets) => ({
      ...prevWidgets,
      [widgetKey]: true,
    }));
  }, [widgetKey]);

  const handleClose = () => {
    setVisibleWidgets((prevWidgets) => {
      const updatedWidgets = { ...prevWidgets };
      delete updatedWidgets[widgetKey];
      return updatedWidgets;
    });
  };

  /**
   * Callback function to handle data received from the widget.
   * @param {any} data - Data received from the widget.
   */
  function widgetRendererCallback(data) {
    console.log("widgetRendererCallback", data);
  }

  const sharedProps = {
    onClose: handleClose,
    widgetRendererCallback,
    widgetKey,
  };

  const renderWidget = () => {
    const WidgetComponent = {
      dropdown: Dropdown,
      alarmbox: AlarmBox,
      infobox: InfoBox,
      pipeclam_map: MapBox,
      alarms_container: AlarmsContainer,
      timeline: Timeline,
    }[widgetConfig.type];

    if (!WidgetComponent) {
      return <div>Unknown widget type</div>;
    }

    return <WidgetComponent {...sharedProps} options={widgetConfig.options} />;
  };

  return visibleWidgets[widgetKey] ? renderWidget() : null;
});

export default WidgetRenderer;
