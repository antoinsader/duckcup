import React, { createContext, useState, useCallback, useRef } from "react";

/**
 * CommandContext
 * Manages command execution and allows components to subscribe to command events
 */
export const CommandContext = createContext();

/**
 * CommandProvider
 * Wrap your app with this to enable command system
 */
export function CommandProvider({ children }) {
  const [executed_command, set_executed_command] = useState(null);
  const [loading, set_loading] = useState(false);

  // Track command listeners: { command_id: [callback1, callback2, ...] }
  const listenersRef = useRef({});
  
  // Track pending command that's waiting for a listener to mount
  const pending_command_ref = useRef(null);

  /**
   * Execute a command by ID
   * Notifies all listeners subscribed to that command
   * If no listeners, stores as pending for when listeners mount
   */
  const executeCommand = useCallback(async (command_id, payload = null) => {
    set_loading(true);
    set_executed_command({ id: command_id, payload, timestamp: Date.now() });

    // Call all listeners for this command
    if (listenersRef.current[command_id] && listenersRef.current[command_id].length > 0) {
      listenersRef.current[command_id].forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error executing command listener for ${command_id}:`, error);
        }
      });
      // Clear pending if command was executed
      pending_command_ref.current = null;
    } else {
      // No listeners yet - store as pending
      pending_command_ref.current = { id: command_id, payload };
    }

    set_loading(false);
  }, []);

  /**
   * Subscribe a component to a command
   * Returns an unsubscribe function
   * Executes immediately if there's a pending command matching this ID
   */
  const subscribeToCommand = useCallback((command_id, callback) => {
    if (!listenersRef.current[command_id]) {
      listenersRef.current[command_id] = [];
    }

    listenersRef.current[command_id].push(callback);

    // Check if there's a pending command for this listener
    if (pending_command_ref.current && pending_command_ref.current.id === command_id) {
      try {
        callback(pending_command_ref.current.payload);
      } catch (error) {
        console.error(`Error executing pending command listener for ${command_id}:`, error);
      }
      // Clear pending after executing
      pending_command_ref.current = null;
    }

    // Return unsubscribe function
    return () => {
      listenersRef.current[command_id] = listenersRef.current[command_id].filter(
        (cb) => cb !== callback
      );
    };
  }, []);

  const value = {
    executed_command,
    loading,
    executeCommand,
    subscribeToCommand,
  };

  return (
    <CommandContext.Provider value={value}>
      {children}
    </CommandContext.Provider>
  );
}

/**
 * Hook to dispatch commands
 * Usage: const { executeCommand } = useCommand();
 */
export function useCommand() {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error("useCommand must be used within CommandProvider");
  }
  return {
    executeCommand: context.executeCommand,
  };
}

/**
 * Hook to listen to a specific command
 * Usage: useCommandListener('add_account', () => { set_add_popup_visible(true); });
 */
export function useCommandListener(command_id, callback) {
  const context = React.useContext(CommandContext);

  React.useEffect(() => {
    if (!context) {
      throw new Error("useCommandListener must be used within CommandProvider");
    }

    const unsubscribe = context.subscribeToCommand(command_id, callback);

    return unsubscribe;
  }, [context, command_id, callback]);
}
