/**
 * Finds the elements present in the master set but missing in the compared set.
 * @param {Set} masterSet - The master set of elements.
 * @param {Set} comparedSet - The set to compare against.
 * @returns {Set} - The set of missing elements.
 */
function findMissingElements(masterSet, comparedSet) {
  return new Set([...masterSet].filter(x => !comparedSet.has(x)));
}

/**
 * Calculates the average of an array of percentages.
 * @param {number[]} percentages - An array of percentages.
 * @returns {number} - The average percentage.
 */
function averagePercentage(percentages) {
  let total = 0;
  for (let i = 0; i < percentages.length; i++) {
    total += percentages[i];
  }
  return total / percentages.length;
}

/**
 * Initializes the alarm data structure.
 * @param {Object} highLevelPaths - High level paths data.
 * @param {Object} data - Additional data.
 * @returns {Object} - An object containing alarm data and expected keys.
 */
function initializeAlarmData(highLevelPaths, data) {
  const siteTurbines = new Set(Object.keys(highLevelPaths));
  const alarmData = {};
  const graphData = {};
  let expectedKeys = new Set();

  siteTurbines.forEach((siteTurbine) => {
    const siteKeys = Object.keys(data.high_level_node_path)
      .filter(key => data.high_level_node_path[key] === siteTurbine);
    const [site, turbine] = siteTurbine.split('/');

    if (!alarmData.hasOwnProperty(site)) {
      alarmData[site] = {};
      graphData[site] = {};
    }

    if (!alarmData[site].hasOwnProperty(turbine)) {
      alarmData[site][turbine] = {};
      graphData[site][turbine] = {};
    }

    // Calculate average percentage
    let percentages = siteKeys.map(key => data.percentage[key]);
    const avgPercentage = averagePercentage(percentages);

    siteKeys.forEach((key) => {
      const parsedKey = parseInt(key, 10);
      let node = data.monitor_node_type_path[parsedKey].split('/').pop() || data.monitor_node_type_path[parsedKey].split('/')[2];
      const percentage = data.percentage[parsedKey];

      // Determine alarm activation
      alarmData[site][turbine][node] = percentage > avgPercentage;
      graphData[site][turbine][node] = percentage;

      // Collect up our expected keys, later used to check if all nodes are present (missing data)
      expectedKeys.add(node);
    });
  });

  return { alarmData, graphData, expectedKeys };
}

/**
 * Finds and sets missing nodes to undefined in the alarm data.
 * @param {Object} alarmData - The alarm data object.
 * @param {Set} expectedKeys - The set of expected keys.
 */
function setMissingElements(alarmData, expectedKeys) {
  Object.keys(alarmData).forEach((site) => {
    Object.keys(alarmData[site]).forEach((turbine) => {
      const nodeKeys = new Set(Object.keys(alarmData[site][turbine]));
      const missingElem = findMissingElements(expectedKeys, nodeKeys);
      if (missingElem.size > 0) {
        alarmData[site][turbine][Array.from(missingElem)[0]] = undefined;
      }
    });
  });
}

function sortData(data) {
  const sortedData = Object.keys(data)
    .sort() // Sort site names alphabetically
    .reduce((sortedObj, site) => {
      // Sort turbine names alphabetically for each site
      sortedObj[site] = Object.keys(data[site]).sort().reduce((sortedTurbines, turbine) => {
        sortedTurbines[turbine] = data[site][turbine];
        return sortedTurbines;
      }, {});
      return sortedObj;
    }, {});

  return sortedData;
}

/**
 * Retrieves alarm data based on the provided high level paths and additional data.
 * @param {Object} highLevelPaths - High level paths data.
 * @param {Object} data - Additional data.
 * @returns {Object} - The alarm data object.
 */
export function getAlarms(highLevelPaths, data) {
  const { alarmData, graphData, expectedKeys } = initializeAlarmData(highLevelPaths, data);
  const sortedAlarmData = sortData(alarmData);
  const sortedGraphData = sortData(graphData);
  setMissingElements(alarmData, expectedKeys);
  return [sortedAlarmData, sortedGraphData];
}
