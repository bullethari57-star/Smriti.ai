// Storage service for prototype persistence using browser localStorage.
// All data is stored in the user's browser profile.

const STORAGE_KEYS = {
  MEMORIES: 'smriti_memories_v1',
  REMINDERS: 'smriti_reminders_v1',
  SETTINGS: 'smriti_settings_v1',
  ACTIVITIES: 'smriti_activities_v1',
  INITIALIZED: 'smriti_initialized_v1',
};

// Default seed demo data for live demonstration
const getDemoMemories = () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  return [
    {
      id: 'demo-mem-1',
      title: "Rahul's Birthday",
      content: "Rahul's birthday is November 15. He loves reading science fiction novels and drinking double espresso.",
      category: "Birthday",
      date: `${currentYear}-11-15`,
      person: "Rahul",
      isDemo: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'demo-mem-2',
      title: "Prof. Sharma's Office Hours",
      content: "Professor Sharma has walk-in office hours in Building B, Room 402 on Tuesdays & Thursdays from 2:00 PM to 4:00 PM.",
      category: "Important Event",
      date: "",
      person: "Prof. Sharma",
      isDemo: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'demo-mem-3',
      title: "Personal Coffee Order",
      content: "Oat milk flat white with cinnamon on top, strictly unsweetened.",
      category: "Preference",
      date: "",
      person: "Me",
      isDemo: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'demo-mem-4',
      title: "Quarterly Learning Goal",
      content: "Complete personal AI memory assistant project setup and prepare live demonstration.",
      category: "Personal Goal",
      date: `${currentYear}-10-10`,
      person: "Suresh",
      isDemo: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
};

const getDemoReminders = () => {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const todayStr = formatYMD(today);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatYMD(tomorrow);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  return [
    {
      id: 'demo-rem-1',
      title: "Call Professor Sharma regarding thesis",
      description: "Discuss draft chapter feedback and scheduling follow-up consultation.",
      date: tomorrowStr,
      time: "09:00",
      category: "Academic",
      priority: "High",
      status: "upcoming",
      linkedMemoryId: "demo-mem-2",
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-rem-2',
      title: "Project Milestone Review",
      description: "Final walkthrough and feature demonstration prep.",
      date: todayStr,
      time: "17:00",
      category: "Project",
      priority: "High",
      status: "upcoming",
      linkedMemoryId: "demo-mem-4",
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-rem-3',
      title: "Return library textbook",
      description: "Return 'Algorithms and Data Structures' to Central Library circulation desk.",
      date: yesterdayStr,
      time: "14:00",
      category: "Personal",
      priority: "Medium",
      status: "overdue",
      linkedMemoryId: null,
      isDemo: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
  ];
};

const DEFAULT_SETTINGS = {
  displayName: 'Suresh',
  voiceResponse: true,
  voiceSpeechRate: 1.0,
  notificationsEnabled: false,
};

export const storageService = {
  // Initialize storage with demo data on first load
  init() {
    if (typeof window === 'undefined') return;
    try {
      const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(getDemoMemories()));
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(getDemoReminders()));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([
          {
            id: 'act-1',
            type: 'create_memory',
            title: "Rahul's Birthday",
            category: 'Memory',
            timestamp: new Date().toISOString(),
            description: 'Loaded demo memory'
          },
          {
            id: 'act-2',
            type: 'create_reminder',
            title: 'Smriti AI Team Review',
            category: 'Reminder',
            timestamp: new Date().toISOString(),
            description: 'Loaded demo reminder'
          }
        ]));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
    } catch (e) {
      console.error('Failed to initialize local storage', e);
    }
  },

  // Reset to initial demo state
  resetToDemo() {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(getDemoMemories()));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(getDemoReminders()));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([
        {
          id: `act-${Date.now()}`,
          type: 'system',
          title: 'Reset to Demo Data',
          category: 'System',
          timestamp: new Date().toISOString(),
          description: 'Restored sample memories and reminders'
        }
      ]));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // Clear all memories and reminders
  clearAll() {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([
        {
          id: `act-${Date.now()}`,
          type: 'system',
          title: 'Cleared All Data',
          category: 'System',
          timestamp: new Date().toISOString(),
          description: 'All local memories and reminders removed'
        }
      ]));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // --- MEMORIES CRUD ---
  getMemories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMemory(memory) {
    const memories = this.getMemories();
    const newMemory = {
      ...memory,
      id: memory.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: memory.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: Boolean(memory.isDemo),
    };
    memories.unshift(newMemory);
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    this.logActivity('create_memory', 'Memory', newMemory.title, 'Created new memory');
    return newMemory;
  },

  updateMemory(id, updates) {
    const memories = this.getMemories();
    const index = memories.findIndex(m => m.id === id);
    if (index === -1) return null;
    const updated = {
      ...memories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    memories[index] = updated;
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    this.logActivity('update_memory', 'Memory', updated.title, 'Updated memory details');
    return updated;
  },

  deleteMemory(id) {
    const memories = this.getMemories();
    const target = memories.find(m => m.id === id);
    const filtered = memories.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(filtered));
    if (target) {
      this.logActivity('delete_memory', 'Memory', target.title, 'Deleted memory');
    }
    return true;
  },

  // --- REMINDERS CRUD ---
  getReminders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      const reminders = data ? JSON.parse(data) : [];
      // Compute dynamically overdue status if not completed
      const now = new Date();
      return reminders.map(r => {
        if (r.status === 'completed') return r;
        if (!r.date) return r;
        
        let remDateTime;
        if (r.time) {
          remDateTime = new Date(`${r.date}T${r.time}:00`);
        } else {
          remDateTime = new Date(`${r.date}T23:59:59`);
        }

        if (!isNaN(remDateTime.getTime()) && remDateTime < now) {
          return { ...r, status: 'overdue' };
        }
        return { ...r, status: 'upcoming' };
      });
    } catch {
      return [];
    }
  },

  saveReminder(reminder) {
    const reminders = this.getReminders();
    const newReminder = {
      ...reminder,
      id: reminder.id || `rem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      status: reminder.status || 'upcoming',
      priority: reminder.priority || 'Medium',
      createdAt: reminder.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: Boolean(reminder.isDemo),
    };
    reminders.unshift(newReminder);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    this.logActivity('create_reminder', 'Reminder', newReminder.title, `Due ${newReminder.date || 'someday'}`);
    return newReminder;
  },

  updateReminder(id, updates) {
    const reminders = this.getReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) return null;
    const updated = {
      ...reminders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    reminders[index] = updated;
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    this.logActivity('update_reminder', 'Reminder', updated.title, 'Updated reminder');
    return updated;
  },

  toggleReminderStatus(id) {
    const reminders = this.getReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) return null;
    const current = reminders[index];
    const newStatus = current.status === 'completed' ? 'upcoming' : 'completed';
    const updated = {
      ...current,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    reminders[index] = updated;
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    this.logActivity(
      newStatus === 'completed' ? 'complete_reminder' : 'reopen_reminder',
      'Reminder',
      updated.title,
      newStatus === 'completed' ? 'Marked as completed' : 'Reopened reminder'
    );
    return updated;
  },

  deleteReminder(id) {
    const reminders = this.getReminders();
    const target = reminders.find(r => r.id === id);
    const filtered = reminders.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(filtered));
    if (target) {
      this.logActivity('delete_reminder', 'Reminder', target.title, 'Deleted reminder');
    }
    return true;
  },

  // --- SETTINGS ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings(updates) {
    const current = this.getSettings();
    const merged = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  },

  // --- ACTIVITIES ---
  getActivities() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  logActivity(type, category, title, description) {
    try {
      const activities = this.getActivities();
      const item = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type,
        category,
        title,
        description,
        timestamp: new Date().toISOString(),
      };
      activities.unshift(item);
      const capped = activities.slice(0, 30);
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(capped));
    } catch (e) {
      console.warn('Could not log activity', e);
    }
  },

  // --- EXPORT & IMPORT ---
  exportBackup() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Smriti AI',
      data: {
        memories: this.getMemories(),
        reminders: this.getReminders(),
        settings: this.getSettings(),
      }
    };
  },

  importBackup(backupObject) {
    if (!backupObject || !backupObject.data) {
      throw new Error('Invalid backup file format.');
    }
    const { memories, reminders, settings } = backupObject.data;
    if (Array.isArray(memories)) {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    }
    if (Array.isArray(reminders)) {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    }
    if (settings && typeof settings === 'object') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }));
    }
    this.logActivity('system', 'System', 'Data Imported', `Imported ${memories?.length || 0} memories and ${reminders?.length || 0} reminders`);
    return true;
  }
};
