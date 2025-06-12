// tabManager.js

const TabManager = (function() {
    let _containerElement = null;
    let _tabListElement = null;
    let _tabContentElement = null;
    let _tabs = [];
    let _activeTabId = null;

    // A reference to the public API object (which is returned by the IIFE)
    // This allows private functions to call public methods.
    let self = {};

    /**
     * Generates a simple unique ID for tabs.
     * @returns {string} A unique ID.
     */
    function _generateUniqueId() {
        return 'tab_' + Math.random().toString(36).substring(2, 9) + Date.now();
    }

    /**
     * Updates the active state of tab headers and iframes.
     * @param {string} newActiveId The ID of the tab to make active.
     */
    function _updateActiveState(newActiveId) {
        _tabs.forEach(tab => {
            const isActive = tab.id === newActiveId;
            if (tab.tabElement) {
                tab.tabElement.classList.toggle('active', isActive);
            }
            if (tab.iframeElement) {
                tab.iframeElement.classList.toggle('active', isActive);
            }
        });
        _activeTabId = newActiveId;
    }

    /**
     * Attaches event listeners for tab switching and closing.
     * Uses event delegation on the tab list container.
     */
    function _attachEventListeners() {
        if (_tabListElement) {
            _tabListElement.addEventListener('click', (event) => {
                const target = event.target;
                const tabHeader = target.closest('.tab-header');
                const closeButton = target.closest('.tab-close-button');

                if (!tabHeader) return; // Not a tab click

                const tabId = tabHeader.dataset.tabId;

                if (closeButton) {
                    // Clicked on the close button
                    event.stopPropagation(); // Prevent tab switch
                    // Call the public closeTab method
                    self.closeTab(tabId); // <--- FIX: Use 'self' to call public method
                } else if (tabId) {
                    // Clicked on the tab header (not close button)
                    // Call the public switchToTab method
                    self.switchToTab(tabId); // <--- FIX: Use 'self' to call public method
                }
            });
        }
    }

    /**
     * Finds a tab object by its ID.
     * @param {string} tabId The ID of the tab to find.
     * @returns {object|undefined} The tab object or undefined if not found.
     */
    function _getTabById(tabId) {
        return _tabs.find(tab => tab.id === tabId);
    }

    // --- Public API Functions (Assigning to 'self' object) ---
    // Define all public methods on 'self' first, then return 'self'
    self = {
        /**
         * Initializes the tab manager within a specified container.
         * This must be called first.
         * @param {string} containerId The ID of the HTML element to render tabs into.
         */
        init: function(containerId) {
            _containerElement = document.getElementById(containerId);
            if (!_containerElement) {
                console.error(`TabManager: Container element with ID '${containerId}' not found.`);
                return false;
            }

            // Create main structure: tab list and content area
            _containerElement.innerHTML = `
                <div class="tab-manager-nav">
                    <ul class="tab-list"></ul>
                    <button class="add-tab-button" title="New Tab">+</button>
                </div>
                <div class="tab-content-area"></div>
            `;

            _tabListElement = _containerElement.querySelector('.tab-list');
            _tabContentElement = _containerElement.querySelector('.tab-content-area');
            const addTabButton = _containerElement.querySelector('.add-tab-button');

            addTabButton.addEventListener('click', () => {
                // Use 'self' here too as this is inside an arrow function,
                // so 'this' might not be the TabManager object.
                self.newTab('about:blank', 'New Tab');
            });

            _attachEventListeners(); // Call the private helper
            console.log(`TabManager: Initialized successfully within '${containerId}'.`);
            return true;
        },

        /**
         * Creates and adds a new tab.
         * @param {string} url The URL to load in the iframe.
         * @param {string} title The title to display on the tab header.
         * @param {boolean} [makeActive=true] Whether to make this new tab active.
         * @returns {string|null} The ID of the new tab, or null if initialization failed.
         */
        newTab: function(url = 'about:blank', title = 'Untitled Tab', makeActive = true) {
            if (!_containerElement) {
                console.error("TabManager: Call .init() first before creating new tabs.");
                return null;
            }

            const tabId = _generateUniqueId();

            // 1. Create Tab Header Element (LI)
            const tabHeaderLi = document.createElement('li');
            tabHeaderLi.classList.add('tab-header');
            tabHeaderLi.dataset.tabId = tabId;
            tabHeaderLi.innerHTML = `
                <span class="tab-title">${title}</span>
                <button class="tab-close-button">×</button>
            `;
            _tabListElement.appendChild(tabHeaderLi);

            // 2. Create Iframe Element
            const iframe = document.createElement('iframe');
            iframe.classList.add('tab-iframe');
            // iframe.setAttribute('src', url); // Set src later to ensure it's in DOM
            iframe.setAttribute('frameborder', '0');
            // Add sandbox attributes for security if needed (e.g., 'allow-scripts allow-same-origin')
            // iframe.setAttribute('sandbox', 'allow-forms allow-popups allow-pointer-lock allow-same-origin allow-scripts');
            _tabContentElement.appendChild(iframe);

            // 3. Store tab data
            const newTab = {
                id: tabId,
                title: title,
                url: url,
                tabElement: tabHeaderLi,
                iframeElement: iframe
            };
            _tabs.push(newTab);

            // Set iframe src after it's in DOM for some browsers
            iframe.src = url;

            if (makeActive) {
                self.switchToTab(tabId); // <--- FIX: Use 'self' to call public method
            } else if (_activeTabId === null && _tabs.length === 1) {
                // If this is the very first tab, make it active regardless of makeActive param
                self.switchToTab(tabId); // <--- FIX: Use 'self' to call public method
            }

            console.log(`TabManager: New tab '${title}' (ID: ${tabId}) created.`);
            return tabId;
        },

        /**
         * Switches the active tab to the one specified by ID.
         * @param {string} tabId The ID of the tab to switch to.
         * @returns {boolean} True if successful, false otherwise.
         */
        switchToTab: function(tabId) {
            if (_activeTabId === tabId) {
                return true; // Already active
            }

            const tabToActivate = _getTabById(tabId);
            if (!tabToActivate) {
                console.warn(`TabManager: Tab with ID '${tabId}' not found.`);
                return false;
            }

            _updateActiveState(tabId); // This calls a private helper
            console.log(`TabManager: Switched to tab '${tabToActivate.title}' (ID: ${tabId}).`);
            return true;
        },

        /**
         * Closes and removes a tab.
         * @param {string} tabId The ID of the tab to close.
         * @returns {boolean} True if successful, false otherwise.
         */
        closeTab: function(tabId) {
            const index = _tabs.findIndex(tab => tab.id === tabId);
            if (index === -1) {
                console.warn(`TabManager: Tab with ID '${tabId}' not found for closing.`);
                return false;
            }

            const tabToClose = _tabs[index];

            // 1. Remove DOM elements
            if (tabToClose.tabElement && tabToClose.tabElement.parentNode) {
                tabToClose.tabElement.parentNode.removeChild(tabToClose.tabElement);
            }
            if (tabToClose.iframeElement && tabToClose.iframeElement.parentNode) {
                tabToClose.iframeElement.parentNode.removeChild(tabToClose.iframeElement);
            }

            // 2. Remove from internal array
            _tabs.splice(index, 1);

            // 3. Handle active tab state if the closed tab was active
            if (_activeTabId === tabId) {
                if (_tabs.length > 0) {
                    // Try to activate the tab to the left, or the first one if closing the first.
                    const newActiveIndex = Math.min(index, _tabs.length - 1);
                    self.switchToTab(_tabs[newActiveIndex].id); // <--- FIX: Use 'self' to call public method
                } else {
                    _activeTabId = null; // No tabs left
                }
            }

            console.log(`TabManager: Tab '${tabToClose.title}' (ID: ${tabId}) closed.`);
            return true;
        },

        /**
         * Updates the URL of an existing tab's iframe.
         * @param {string} tabId The ID of the tab to update.
         * @param {string} newUrl The new URL to load.
         * @returns {boolean} True if successful, false otherwise.
         */
        updateTabContent: function(tabId, newUrl) {
            const tab = _getTabById(tabId);
            if (tab && tab.iframeElement) {
                tab.iframeElement.src = newUrl;
                tab.url = newUrl;
                console.log(`TabManager: Tab '${tab.title}' (ID: ${tabId}) content updated to '${newUrl}'.`);
                return true;
            }
            console.warn(`TabManager: Could not update content for tab ID '${tabId}'. Tab not found or iframe missing.`);
            return false;
        },

        /**
         * Updates the title displayed on an existing tab.
         * @param {string} tabId The ID of the tab to update.
         * @param {string} newTitle The new title for the tab.
         * @returns {boolean} True if successful, false otherwise.
         */
        updateTabTitle: function(tabId, newTitle) {
            const tab = _getTabById(tabId);
            if (tab && tab.tabElement) {
                const titleSpan = tab.tabElement.querySelector('.tab-title');
                if (titleSpan) {
                    titleSpan.textContent = newTitle;
                    tab.title = newTitle;
                    console.log(`TabManager: Tab ID '${tabId}' title updated to '${newTitle}'.`);
                    return true;
                }
            }
            console.warn(`TabManager: Could not update title for tab ID '${tabId}'. Tab not found or title span missing.`);
            return false;
        },

        /**
         * Gets the data for the currently active tab.
         * @returns {object|null} The active tab object or null if no tab is active.
         */
        getCurrentTab: function() {
            if (!_activeTabId) return null;
            return _getTabById(_activeTabId);
        },

        /**
         * Gets an array of data for all open tabs.
         * @returns {Array<object>} An array of tab objects.
         */
        getAllTabs: function() {
            return _tabs.map(tab => ({
                id: tab.id,
                title: tab.title,
                url: tab.url,
                isActive: tab.id === _activeTabId
            }));
        }
    }; // End of 'self' object definition

    return self; // Return the public API object
})();

// For direct inclusion in HTML, attach to window
// For module systems, use 'export default TabManager;'
if (typeof window !== 'undefined') {
    window.TabManager = TabManager;
}
