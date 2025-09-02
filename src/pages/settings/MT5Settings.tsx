import React, { useState, useEffect } from 'react';
import {
  Server,
  Plus,
  Edit3,
  Trash2,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  X,
  Wifi,
  WifiOff,
  Clock,
  DollarSign
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { MT5ConnectionForm, MT5Connection } from '../../types/settings';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

const MT5Settings: React.FC = () => {
  const {
    mt5Connections,
    isLoading,
    error,
    fetchMT5Connections,
    createMT5Connection,
    updateMT5Connection,
    deleteMT5Connection,
    testMT5Connection,
    clearError
  } = useSettingsStore();

  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<MT5Connection | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  
  const [connectionForm, setConnectionForm] = useState<MT5ConnectionForm>({
    name: '',
    broker: '',
    server: '',
    login: '',
    password: '',
    accountType: 'demo',
    isDefault: false
  });

  useEffect(() => {
    fetchMT5Connections();
  }, [fetchMT5Connections]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const resetForm = () => {
    setConnectionForm({
      name: '',
      broker: '',
      server: '',
      login: '',
      password: '',
      accountType: 'demo',
      isDefault: false
    });
    setEditingConnection(null);
    setShowForm(false);
  };

  const handleEdit = (connection: MT5Connection) => {
    setConnectionForm({
      name: connection.name,
      broker: connection.broker,
      server: connection.server,
      login: connection.login,
      password: '', // Don't populate password for security
      accountType: connection.account_type,
      isDefault: connection.is_default
    });
    setEditingConnection(connection);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingConnection) {
        await updateMT5Connection(editingConnection.id, {
          name: connectionForm.name,
          broker: connectionForm.broker,
          server: connectionForm.server,
          login: connectionForm.login,
          password: connectionForm.password || undefined,
          account_type: connectionForm.accountType,
          is_default: connectionForm.isDefault
        });
        toast.success('MT5 connection updated successfully');
      } else {
        await createMT5Connection({
          name: connectionForm.name,
          broker: connectionForm.broker,
          server: connectionForm.server,
          login: connectionForm.login,
          password: connectionForm.password,
          account_type: connectionForm.accountType,
          is_default: connectionForm.isDefault
        });
        toast.success('MT5 connection created successfully');
      }
      resetForm();
    } catch (error) {
      toast.error(`Failed to ${editingConnection ? 'update' : 'create'} MT5 connection`);
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this MT5 connection?')) {
      return;
    }

    try {
      await deleteMT5Connection(connectionId);
      toast.success('MT5 connection deleted successfully');
    } catch (error) {
      toast.error('Failed to delete MT5 connection');
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnection(connectionId);
    try {
      const result = await testMT5Connection(connectionId);
      if (result.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(`Connection test failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to test connection');
    } finally {
      setTestingConnection(null);
    }
  };

  const togglePasswordVisibility = (connectionId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [connectionId]: !prev[connectionId]
    }));
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const brokerOptions = [
    'MetaQuotes Demo',
    'FXCM',
    'IG Markets',
    'OANDA',
    'Interactive Brokers',
    'TD Ameritrade',
    'Charles Schwab',
    'E*TRADE',
    'Alpaca',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            MT5 Connections
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your MetaTrader 5 broker connections and credentials
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Connection</span>
        </button>
      </div>

      {/* Connection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingConnection ? 'Edit' : 'Add'} MT5 Connection
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Connection Name
                </label>
                <input
                  type="text"
                  value={connectionForm.name}
                  onChange={(e) => setConnectionForm({ ...connectionForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="My Trading Account"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Broker
                </label>
                <select
                  value={connectionForm.broker}
                  onChange={(e) => setConnectionForm({ ...connectionForm, broker: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select broker</option>
                  {brokerOptions.map(broker => (
                    <option key={broker} value={broker}>{broker}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Server
                </label>
                <input
                  type="text"
                  value={connectionForm.server}
                  onChange={(e) => setConnectionForm({ ...connectionForm, server: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="MetaQuotes-Demo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Login
                </label>
                <input
                  type="text"
                  value={connectionForm.login}
                  onChange={(e) => setConnectionForm({ ...connectionForm, login: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="123456789"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.form ? 'text' : 'password'}
                    value={connectionForm.password}
                    onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={editingConnection ? 'Leave empty to keep current password' : 'Enter password'}
                    required={!editingConnection}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('form')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.form ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <select
                  value={connectionForm.accountType}
                  onChange={(e) => setConnectionForm({ ...connectionForm, accountType: e.target.value as 'demo' | 'live' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="demo">Demo Account</option>
                  <option value="live">Live Account</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={connectionForm.isDefault}
                  onChange={(e) => setConnectionForm({ ...connectionForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Set as default connection
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : editingConnection ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connections List */}
      <div className="space-y-4">
        {mt5Connections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No MT5 Connections
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add your first MetaTrader 5 connection to start trading
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Connection</span>
            </button>
          </div>
        ) : (
          mt5Connections.map((connection) => (
            <div
              key={connection.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {connection.name}
                    </h3>
                    {connection.is_default && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium rounded-full">
                        Default
                      </span>
                    )}
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      connection.account_type === 'live'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    )}>
                      {connection.account_type === 'live' ? 'Live' : 'Demo'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Broker:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{connection.broker}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Server:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{connection.server}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Login:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{connection.login}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <div className="flex items-center space-x-2">
                        {getConnectionStatusIcon(connection.status)}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getConnectionStatusText(connection.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {connection.last_connected && (
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      Last connected: {new Date(connection.last_connected).toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleTestConnection(connection.id)}
                    disabled={testingConnection === connection.id}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <TestTube className="w-3 h-3" />
                    <span>{testingConnection === connection.id ? 'Testing...' : 'Test'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleEdit(connection)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(connection.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connection Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Connection Tips
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Ensure your MT5 terminal is running and logged in</li>
              <li>• Check that Expert Advisors are enabled in your MT5 settings</li>
              <li>• Verify your broker allows API connections</li>
              <li>• Use demo accounts for testing before connecting live accounts</li>
              <li>• Keep your login credentials secure and never share them</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MT5Settings;