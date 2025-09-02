import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsLayout } from '../components/SettingsLayout';
import AccountSettings from './settings/AccountSettings';
import MT5Settings from './settings/MT5Settings';
import TradingPreferences from './settings/TradingPreferences';
import UICustomization from './settings/UICustomization';
import NotificationSettings from './settings/NotificationSettings';
import SecuritySettings from './settings/SecuritySettings';
import DataBackup from './settings/DataBackup';
import MobileSettings from './settings/MobileSettings';

const Settings: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SettingsLayout />}>
        <Route index element={<Navigate to="account" replace />} />
        <Route path="account" element={<AccountSettings />} />
        <Route path="mt5" element={<MT5Settings />} />
        <Route path="trading" element={<TradingPreferences />} />
        <Route path="ui" element={<UICustomization />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="data" element={<DataBackup />} />
        <Route path="mobile" element={<MobileSettings />} />
      </Route>
    </Routes>
  );
};

export default Settings;