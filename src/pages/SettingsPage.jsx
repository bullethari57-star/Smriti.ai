import React, { useState, useRef } from 'react';
import { 
  Settings, 
  User, 
  Volume2, 
  Bell, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function SettingsPage() {
  const { 
    settings, 
    updateSettings, 
    resetToDemo, 
    clearAllData, 
    importBackup,
    addToast
  } = useApp();

  const [displayName, setDisplayName] = useState(settings.displayName || 'Suresh');
  const [voiceResponse, setVoiceResponse] = useState(Boolean(settings.voiceResponse));
  const [notifPermission, setNotifPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported';
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateSettings({ displayName: displayName.trim() || 'Suresh', voiceResponse });
  };

  const handleVoiceToggle = (checked) => {
    setVoiceResponse(checked);
    updateSettings({ voiceResponse: checked });
  };

  const handleRequestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast('Browser notifications are not supported in this browser.', 'error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        updateSettings({ notificationsEnabled: true });
        addToast('Browser notifications enabled!', 'success');
        try {
          new Notification('Smriti AI Notifications Enabled', {
            body: 'You will receive reminders when this app is active.',
            icon: '/favicon.svg'
          });
        } catch {
          // ignore
        }
      } else {
        updateSettings({ notificationsEnabled: false });
        addToast(`Notification permission was ${permission}.`, 'info');
      }
    } catch (e) {
      addToast('Could not request notification permissions: ' + e.message, 'error');
    }
  };

  // Export Data JSON download
  const handleExportData = () => {
    try {
      const backup = storageService.exportBackup();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `smriti_ai_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Backup downloaded successfully', 'success');
    } catch (e) {
      addToast('Export failed: ' + e.message, 'error');
    }
  };

  // Import Data JSON
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const success = importBackup(parsed);
        if (success) {
          setDisplayName(storageService.getSettings().displayName || 'Suresh');
          setVoiceResponse(storageService.getSettings().voiceResponse);
        }
      } catch (err) {
        addToast('Invalid JSON backup file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-3xl pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-slate-700" />
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Configure your personal experience, voice responses, and data storage
        </p>
      </div>

      {/* Profile & Name Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-900">User Profile</h2>
            <p className="text-xs text-slate-500">How Smriti AI greets and addresses you</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="pref-name" className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Your Display Name
            </label>
            <input
              id="pref-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Suresh"
              className="w-full sm:w-80 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-navy-950 hover:bg-navy-900 rounded-xl transition-all shadow-sm"
          >
            Save Display Name
          </button>
        </form>
      </div>

      {/* Voice & Notifications Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft space-y-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">Voice & Speech</h2>
              <p className="text-xs text-slate-500">Audio playback and reading assistant responses</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-sm font-semibold text-navy-900">Auto-read AI Responses</p>
              <p className="text-xs text-slate-500">
                Automatically speak AI replies aloud using speech synthesis.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={voiceResponse}
                onChange={(e) => handleVoiceToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">Browser Notifications</h2>
              <p className="text-xs text-slate-500">Due reminder alerts while app tab is open</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-navy-900">Status:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  notifPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : notifPermission === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {notifPermission === 'granted' ? 'Allowed' : notifPermission === 'denied' ? 'Blocked' : 'Default / Not Requested'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Note: In-app reminder banners are always active. System notifications require browser permission.
              </p>
            </div>

            {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
              <button
                onClick={handleRequestNotification}
                className="px-3.5 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors self-start sm:self-auto"
              >
                Request Permission
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft space-y-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-900">Data Management & Backup</h2>
            <p className="text-xs text-slate-500">Export or import your saved memories and reminders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Export to JSON</h3>
              <p className="text-xs text-slate-500 mt-1">
                Save a local backup file containing all your memories, reminders, and settings.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="mt-4 flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Import from JSON</h3>
              <p className="text-xs text-slate-500 mt-1">
                Restore your memories from a previously exported Smriti AI backup file.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                id="backup-file-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Backup File</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reset / Clear Data */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Reset or Clear Data</h3>
            <p className="text-xs text-slate-500">Restore demo samples or clear saved data</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Demo Data</span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* About Smriti AI */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-navy-950 to-indigo-950 text-white shadow-soft space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/30 flex items-center justify-center border border-violet-500/40">
            <Sparkles className="w-4 h-4 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-base font-bold">About Smriti AI</h2>
            <p className="text-xs text-violet-300">Personal AI Memory Assistant</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Remember what matters. Let AI handle the rest. Smriti AI helps you remember personal facts, birthdays, preferences, and deadlines accurately.
        </p>
      </div>

      {/* Confirmation Modals */}
      {showResetConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowResetConfirm(false)}
          title="Restore Demo Data?"
          message="This will overwrite current data and reload the sample demonstration memories and reminders (including Rahul's birthday)."
          confirmText="Restore Demo Data"
          confirmVariant="primary"
          onConfirm={resetToDemo}
        />
      )}

      {showClearConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowClearConfirm(false)}
          title="Clear All Local Data?"
          message="Are you sure you want to delete all saved memories and reminders? This cannot be undone unless you have an exported backup."
          confirmText="Clear Everything"
          confirmVariant="danger"
          onConfirm={clearAllData}
        />
      )}
    </div>
  );
}
