/**
 * Command Registry
 * Defines all available commands that can be executed throughout the application
 * Includes manual commands + dynamically generated navigation commands from routes
 */

export const COMMAND_IDS = {
  ADD_ACCOUNT: "add_account",
  LOGOUT: "logout",
  CLOSE_ALL_TABS: "close_all_tabs",

};

// Manual commands
const manual_commands = [
  {
    id: COMMAND_IDS.ADD_ACCOUNT,
    name: "Add an account",
    description: "Add a new account",
    category: "Accounts",
    keys: ["create an account", "add an account", "register an account"],
    page_id: 5,
    handler_fn: null,
  },
  {
    id: COMMAND_IDS.LOGOUT,
    name: "Logout",
    description: "Logout from current user session",
    category: "User",
    keys: ["logout", "log out", "sign out", "disconnect user"],
    page_id: 300,
    handler_fn: null,
  },
  {
    id: COMMAND_IDS.CLOSE_ALL_TABS,
    name: "Close all tabs",
    description: "Close all open tabs and return to home page",
    category: "Navigation",
    keys: ["close all tabs", "close tabs", "close all", "clear tabs"],
    page_id: null,
    handler_fn: null,
  }
  // Add more manual commands here as needed
];

/**
 * Generate navigation commands from routes
 * Creates "Open X page" commands for each available route
 * @param {array} routes - Array of route objects from routes.js
 * @returns {array} Array of navigation commands
 */
export const generateNavigationCommands = (routes) => {
  return routes
    .filter((route) => !route.hide_sidebar) // Don't create commands for hidden routes
    .map((route) => ({
      id: `open_${route.id}_page`,
      name: `Open ${route.label} page`,
      description: `Navigate to ${route.label}`,
      category: "Navigation",
      keys: [
        `open ${route.label.toLowerCase()} page`,
        `go to ${route.label.toLowerCase()} page`,
        `navigate to ${route.label.toLowerCase()}`,
        route.label.toLowerCase(),
      ],
      route_id: route.id, // Store route id for navigation
      handler_fn: null,
    }));
    
};

// Initialize with manual commands
export let commands = [...manual_commands];

/**
 * Initialize commands with routes
 * Should be called once when the app loads with the routes data
 * @param {array} routes - Array of route objects from routes.js
 */
export const initializeCommands = (routes) => {
  commands = [...manual_commands, ...generateNavigationCommands(routes)];
};

/**
 * Get commands that are available on a specific page
 * @param {number|null} page_id - The page identifier (route id) or null for all pages
 * @returns {array} Array of commands available on that page
 */
export const getCommandsByPage = (page_id) => {
  return commands.filter((cmd) => cmd.page_id === null || cmd.page_id === page_id);
};

/**
 * Fuzzy search commands by query string
 * Matches against name, description, and keys fields
 * Priority: keys > name > description
 * @param {string} query - Search query
 * @returns {array} Array of matching commands
 */
export const fuzzySearchCommands = (query) => {
    if (!query || query.trim().length === 0) {
        return commands;
    }
    
    const lowerQuery = query.toLowerCase();
    
    const cmds = commands
    .filter((cmd) => {
      const nameMatch = cmd.name.toLowerCase().includes(lowerQuery);
      const descMatch = cmd.description.toLowerCase().includes(lowerQuery);
      const keysMatch = cmd.keys && cmd.keys.some((key) => key.toLowerCase().includes(lowerQuery));
      return nameMatch || descMatch || keysMatch;
    })
    .sort((a, b) => {
        // Prioritize: keys > name > description
        const aKeyMatch = a.keys && a.keys.some((key) => key.toLowerCase().includes(lowerQuery));
        const bKeyMatch = b.keys && b.keys.some((key) => key.toLowerCase().includes(lowerQuery));
        const aNameMatch = a.name.toLowerCase().includes(lowerQuery);
        const bNameMatch = b.name.toLowerCase().includes(lowerQuery);
        
        // Keys match has highest priority
        if (aKeyMatch && !bKeyMatch) return -1;
        if (!aKeyMatch && bKeyMatch) return 1;
        
        // Name match is second priority
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        return 0;
    });

    return cmds;
};
