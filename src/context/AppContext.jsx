import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation active tab
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Core Data States
  const [memories, setMemories] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [settings, setSettings] = useState({
    displayName: 'Suresh',
    voiceResponse: true,
    notificationsEnabled: false,
  });
  const [activities, setActivities] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Chat conversation state (session-level persistence)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: "Hello! I'm Smriti AI, your personal memory assistant. Ask me anything about your saved facts, birthdays, and reminders, or tell me what to remember!",
      timestamp: new Date().toISOString(),
      action: null,
    }
  ]);

  // Toast system state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initialize and load data from storage
  const refreshData = useCallback(() => {
    storageService.init();
    setMemories(storageService.getMemories());
    setReminders(storageService.getReminders());
    setSettings(storageService.getSettings());
    setActivities(storageService.getActivities());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Memory operations
  const addMemory = useCallback((memoryData) => {
    const created = storageService.saveMemory(memoryData);
    setMemories(storageService.getMemories());
    setActivities(storageService.getActivities());
    addToast(`Saved memory: "${created.title}"`, 'success');
    return created;
  }, [addToast]);

  const updateMemory = useCallback((id, updates) => {
    const updated = storageService.updateMemory(id, updates);
    setMemories(storageService.getMemories());
    setActivities(storageService.getActivities());
    addToast(`Updated memory: "${updated.title}"`, 'success');
    return updated;
  }, [addToast]);

  const deleteMemory = useCallback((id) => {
    storageService.deleteMemory(id);
    setMemories(storageService.getMemories());
    setActivities(storageService.getActivities());
    addToast('Memory deleted', 'info');
  }, [addToast]);

  // Reminder operations
  const addReminder = useCallback((reminderData) => {
    const created = storageService.saveReminder(reminderData);
    setReminders(storageService.getReminders());
    setActivities(storageService.getActivities());
    addToast(`Reminder set: "${created.title}"`, 'success');
    return created;
  }, [addToast]);

  const updateReminder = useCallback((id, updates) => {
    const updated = storageService.updateReminder(id, updates);
    setReminders(storageService.getReminders());
    setActivities(storageService.getActivities());
    addToast(`Updated reminder: "${updated.title}"`, 'success');
    return updated;
  }, [addToast]);

  const toggleReminder = useCallback((id) => {
    const updated = storageService.toggleReminderStatus(id);
    setReminders(storageService.getReminders());
    setActivities(storageService.getActivities());
    const statusMsg = updated.status === 'completed' ? 'Completed' : 'Reopened';
    addToast(`Reminder ${statusMsg}: "${updated.title}"`, 'info');
    return updated;
  }, [addToast]);

  const deleteReminder = useCallback((id) => {
    storageService.deleteReminder(id);
    setReminders(storageService.getReminders());
    setActivities(storageService.getActivities());
    addToast('Reminder deleted', 'info');
  }, [addToast]);

  // Settings operations
  const updateSettings = useCallback((updates) => {
    const updated = storageService.updateSettings(updates);
    setSettings(updated);
    addToast('Settings saved', 'success');
    return updated;
  }, [addToast]);

  // Reset to demo data
  const resetToDemo = useCallback(() => {
    storageService.resetToDemo();
    refreshData();
    addToast('Reset to demo memories and reminders', 'info');
  }, [refreshData, addToast]);

  // Clear all data
  const clearAllData = useCallback(() => {
    storageService.clearAll();
    refreshData();
    addToast('All local data cleared', 'info');
  }, [refreshData, addToast]);

  // Import data backup
  const importBackup = useCallback((backup) => {
    try {
      storageService.importBackup(backup);
      refreshData();
      addToast('Backup imported successfully', 'success');
      return true;
    } catch (e) {
      addToast(`Import failed: ${e.message}`, 'error');
      return false;
    }
  }, [refreshData, addToast]);

  // Check for due or overdue reminders for notification banner
  const dueReminders = reminders.filter(r => r.status === 'overdue' || (r.status === 'upcoming' && r.date === new Date().toISOString().slice(0, 10)));
  const overdueReminders = reminders.filter(r => r.status === 'overdue');

  const value = {
    currentTab,
    setCurrentTab,
    memories,
    reminders,
    settings,
    activities,
    isLoaded,
    chatMessages,
    setChatMessages,
    toasts,
    addToast,
    removeToast,
    addMemory,
    updateMemory,
    deleteMemory,
    addReminder,
    updateReminder,
    toggleReminder,
    deleteReminder,
    updateSettings,
    resetToDemo,
    clearAllData,
    importBackup,
    dueReminders,
    overdueReminders,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
