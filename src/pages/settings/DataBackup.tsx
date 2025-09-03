import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Database,
  Calendar,
  Clock,
  FileText,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RotateCcw,
  Cloud,
  HardDrive,
  Mail,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Archive,
  FileDown,
  FileUp
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { DataBackupPreferencesForm } from '../../types/settings';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

interface BackupRecord {
  id: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
  size: string;
  created_at: string;
  expires_at?: string;
}

interface ExportRequest {
  id: string;
  data_type: string;
  format: 'json' | 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  download_url?: string;
  expires_at?: string;
}

const DataBackup: React.FC = () => {
  const {
    userSettings,
    isLoading,
    error,
    fetchUserSettings,
    updateDataBackupPreferences,
    clearError
  } = useSettingsStore();

  const [backupForm, setBackupForm] = useState<DataBackupPreferencesForm>({
    autoBackup: true,
    backupFrequency: 'weekly',
    backupRetention: 30,
    includeTradeHistory: true,
    includeSettings: true,
    includePersonalData: false,
    cloudStorage: false,
    encryptBackups: true,
    gdprCompliance: true,
    retentionPeriod: 365
  });

  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showGdprOptions, setShowGdprOptions] = useState(false);

  const backupFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'never', label: 'Never (Manual only)' }
  ];

  const retentionOptions = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '6 months' },
    { value: 365, label: '1 year' }
  ];

  const dataRetentionOptions = [
    { value: 90, label: '3 months' },
    { value: 180, label: '6 months' },
    { value: 365, label: '1 year' },
    { value: 730, label: '2 years' },
    { value: 1825, label: '5 years' },
    { value: 3650, label: '10 years' },
    { value: 0, label: 'Forever' }
  ];

  const exportFormats = [
    { value: 'json', label: 'JSON', description: 'Machine-readable format' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet format' },
    { value: 'pdf', label: 'PDF', description: 'Human-readable report' }
  ];

  const exportDataTypes = [
    { value: 'all', label: 'All Data', description: 'Complete account export' },
    { value: 'trades', label: 'Trade History', description: 'All trading activities' },
    { value: 'settings', label: 'Settings', description: 'Account preferences' },
    { value: 'personal', label: 'Personal Data', description: 'Profile information' },
    { value: 'connections', label: 'MT5 Connections', description: 'Broker configurations' }
  ];

  useEffect(() => {
    fetchUserSettings();
    loadBackupRecords();
    loadExportRequests();
  }, [fetchUserSettings]);

  useEffect(() => {
    if (userSettings?.data_backup_preferences) {
      const backup = userSettings.data_backup_preferences;
      setBackupForm({
        autoBackup: backup.auto_backup !== false,
        backupFrequency: backup.backup_frequency || 'weekly',
        backupRetention: backup.backup_retention || 30,
        includeTradeHistory: backup.include_trade_history !== false,
        includeSettings: backup.include_settings !== false,
        includePersonalData: backup.include_personal_data || false,
        cloudStorage: backup.cloud_storage || false,
        encryptBackups: backup.encrypt_backups !== false,
        gdprCompliance: backup.gdpr_compliance !== false,
        retentionPeriod: backup.data_retention_period || 365
      });
    }
  }, [userSettings]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const loadBackupRecords = async () => {
    // Mock data - in real app, fetch from API
    const mockRecords: BackupRecord[] = [
      {
        id: '1',
        type: 'automatic',
        status: 'completed',
        size: '2.4 MB',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'manual',
        status: 'completed',
        size: '1.8 MB',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'automatic',
        status: 'failed',
        size: '0 MB',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setBackupRecords(mockRecords);
  };

  const loadExportRequests = async () => {
    // Mock data - in real app, fetch from API
    const mockRequests: ExportRequest[] = [
      {
        id: '1',
        data_type: 'all',
        format: 'json',
        status: 'completed',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        download_url: '#',
        expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        data_type: 'trades',
        format: 'csv',
        status: 'processing',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];
    setExportRequests(mockRequests);
  };

  const handleFormChange = (field: keyof DataBackupPreferencesForm, value: any) => {
    setBackupForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateDataBackupPreferences({
        autoBackup: backupForm.autoBackup,
        backupFrequency: backupForm.backupFrequency,
        backupRetention: backupForm.backupRetention,
        includeTradeHistory: backupForm.includeTradeHistory,
        includeSettings: backupForm.includeSettings,
        includePersonalData: backupForm.includePersonalData,
        cloudStorage: backupForm.cloudStorage,
        encryptBackups: backupForm.encryptBackups,
        gdprCompliance: backupForm.gdprCompliance,
        retentionPeriod: backupForm.retentionPeriod
      });
      toast.success('Data & backup preferences updated successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update data & backup preferences');
    }
  };

  const handleReset = () => {
    if (userSettings?.data_backup_preferences) {
      const backup = userSettings.data_backup_preferences;
      setBackupForm({
        autoBackup: backup.auto_backup !== false,
        backupFrequency: backup.backup_frequency || 'weekly',
        backupRetention: backup.backup_retention || 30,
        includeTradeHistory: backup.include_trade_history !== false,
        includeSettings: backup.include_settings !== false,
        includePersonalData: backup.include_personal_data || false,
        cloudStorage: backup.cloud_storage || false,
        encryptBackups: backup.encrypt_backups !== false,
        gdprCompliance: backup.gdpr_compliance !== false,
        retentionPeriod: backup.data_retention_period || 365
      });
    }
    setHasChanges(false);
  };

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // In real app, call API to create backup
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        type: 'manual',
        status: 'completed',
        size: '2.1 MB',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + backupForm.backupRetention * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setBackupRecords(prev => [newBackup, ...prev]);
      toast.success('Manual backup created successfully');
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = (backupId: string) => {
    // In real app, generate download URL and trigger download
    toast.success('Backup download started');
  };

  const deleteBackup = async (backupId: string) => {
    try {
      setBackupRecords(prev => prev.filter(backup => backup.id !== backupId));
      toast.success('Backup deleted successfully');
    } catch (error) {
      toast.error('Failed to delete backup');
    }
  };

  const requestDataExport = async (dataType: string, format: string) => {
    try {
      const newRequest: ExportRequest = {
        id: Date.now().toString(),
        data_type: dataType,
        format: format as 'json' | 'csv' | 'pdf',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      setExportRequests(prev => [newRequest, ...prev]);
      toast.success('Export request submitted successfully');
      
      // Simulate processing
      setTimeout(() => {
        setExportRequests(prev => prev.map(req => 
          req.id === newRequest.id 
            ? { ...req, status: 'processing' }
            : req
        ));
      }, 1000);
      
      setTimeout(() => {
        setExportRequests(prev => prev.map(req => 
          req.id === newRequest.id 
            ? { 
                ...req, 
                status: 'completed',
                download_url: '#',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              }
            : req
        ));
      }, 5000);
    } catch (error) {
      toast.error('Failed to request data export');
    }
  };

  const handleFileImport = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    try {
      // In real app, upload and process the file
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing
      toast.success('Data imported successfully');
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const requestAccountDeletion = async () => {
    // In real app, this would trigger GDPR-compliant account deletion process
    toast.success('Account deletion request submitted. You will receive confirmation via email.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Backup Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Backup Settings
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Automatic Backups
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically create backups of your data
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('autoBackup', !backupForm.autoBackup)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  backupForm.autoBackup ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  backupForm.autoBackup ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            {backupForm.autoBackup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={backupForm.backupFrequency}
                  onChange={(e) => handleFormChange('backupFrequency', e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {backupFrequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Retention Period
              </label>
              <select
                value={backupForm.backupRetention}
                onChange={(e) => handleFormChange('backupRetention', parseInt(e.target.value))}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {retentionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                How long to keep backup files
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Include in Backups:
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Trade History</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFormChange('includeTradeHistory', !backupForm.includeTradeHistory)}
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      backupForm.includeTradeHistory ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    <span className={cn(
                      'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                      backupForm.includeTradeHistory ? 'translate-x-5' : 'translate-x-1'
                    )} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Settings &amp; Preferences</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFormChange('includeSettings', !backupForm.includeSettings)}
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      backupForm.includeSettings ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    <span className={cn(
                      'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                      backupForm.includeSettings ? 'translate-x-5' : 'translate-x-1'
                    )} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Personal Data</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFormChange('includePersonalData', !backupForm.includePersonalData)}
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      backupForm.includePersonalData ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    <span className={cn(
                      'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                      backupForm.includePersonalData ? 'translate-x-5' : 'translate-x-1'
                    )} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cloud className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cloud Storage
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Store backups in secure cloud storage
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('cloudStorage', !backupForm.cloudStorage)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  backupForm.cloudStorage ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  backupForm.cloudStorage ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Encrypt Backups
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Encrypt backup files for additional security
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('encryptBackups', !backupForm.encryptBackups)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  backupForm.encryptBackups ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  backupForm.encryptBackups ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* GDPR Compliance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                GDPR Compliance &amp; Data Rights
              </h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    GDPR Compliance Mode
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable enhanced data protection and privacy controls
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFormChange('gdprCompliance', !backupForm.gdprCompliance)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  backupForm.gdprCompliance ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  backupForm.gdprCompliance ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Retention Period
              </label>
              <select
                value={backupForm.retentionPeriod}
                onChange={(e) => handleFormChange('retentionPeriod', parseInt(e.target.value))}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {dataRetentionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                How long to retain your personal data
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Your Data Rights
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Under GDPR, you have the right to access, rectify, erase, restrict processing, 
                    data portability, and object to processing of your personal data.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowGdprOptions(!showGdprOptions)}
                    className="flex items-center space-x-2 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {showGdprOptions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showGdprOptions ? 'Hide' : 'Show'} GDPR Options</span>
                  </button>
                </div>
              </div>
            </div>
            
            {showGdprOptions && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => requestDataExport('all', 'json')}
                    className="flex items-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Request Data Export</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={requestAccountDeletion}
                    className="flex items-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Request Account Deletion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Changes</span>
          </button>
          
          <button
            type="submit"
            disabled={!hasChanges || isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Backup Settings'}</span>
          </button>
        </div>
      </form>

      {/* Manual Backup & Import */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manual Backup &amp; Import
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create Manual Backup
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create an immediate backup of your current data
              </p>
              <button
                onClick={createManualBackup}
                disabled={isCreatingBackup}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingBackup ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isCreatingBackup ? 'Creating...' : 'Create Backup'}</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Import Data
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Restore data from a previously exported backup file
              </p>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                />
                <button
                  onClick={handleFileImport}
                  disabled={!selectedFile || isImporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Archive className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Backup History
              </h3>
            </div>
            <button
              onClick={loadBackupRecords}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {backupRecords.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(backup.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {backup.type === 'manual' ? 'Manual Backup' : 'Automatic Backup'}
                      </h4>
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        backup.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        backup.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      )}>
                        {backup.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Size: {backup.size}</span>
                      <span>Created: {formatDate(backup.created_at)}</span>
                      {backup.expires_at && (
                        <span>Expires: {formatDate(backup.expires_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {backup.status === 'completed' && (
                    <button
                      onClick={() => downloadBackup(backup.id)}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteBackup(backup.id)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Export Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FileUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Export Requests
            </h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportDataTypes.map((dataType) => (
              <div key={dataType.value} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {dataType.label}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {dataType.description}
                </p>
                <div className="flex space-x-2">
                  {exportFormats.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => requestDataExport(dataType.value, format.value)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title={format.description}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {exportRequests.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recent Export Requests:
              </h4>
              <div className="space-y-3">
                {exportRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {exportDataTypes.find(t => t.value === request.data_type)?.label} ({request.format.toUpperCase()})
                          </span>
                          <span className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            request.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            request.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          )}>
                            {request.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Requested: {formatDate(request.created_at)}
                          {request.expires_at && (
                            <span> • Expires: {formatDate(request.expires_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {request.status === 'completed' && request.download_url && (
                      <button
                        onClick={() => window.open(request.download_url, '_blank')}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataBackup;