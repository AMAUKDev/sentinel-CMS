/**
 * Toggles the sidebar icons for the main dashboard.
 */
export function toggleMainSidebarIcons() {
  const icon1 = document.getElementById("main-x-1");
  const icon2 = document.getElementById("main-x-2");
  const icon3 = document.getElementById("main-x-3");
  
  icon1.classList.toggle('a');
  icon2.classList.toggle('b');
  icon3.classList.toggle('c');
}

/**
 * Toggles the sidebar icons for the Pipeclam dashboard.
 * 
 * @param {string} widgetKey - The key of the widget.
 */
export function togglePipeclamSidebarIcons(widgetKey) {
  const icon1 = document.getElementById(`pipeclam-x-1-${widgetKey}`);
  const icon2 = document.getElementById(`pipeclam-x-2-${widgetKey}`);
  const icon3 = document.getElementById(`pipeclam-x-3-${widgetKey}`);
  
  icon1.classList.toggle('a');
  icon2.classList.toggle('b');
  icon3.classList.toggle('c');
}
