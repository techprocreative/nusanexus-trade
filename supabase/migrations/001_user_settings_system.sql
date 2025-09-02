-- User Settings System Migration
-- This migration creates all tables, indexes, RLS policies, and triggers for the user settings system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    country VARCHAR(2),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    time_format VARCHAR(10) DEFAULT '12h',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('trading', 'ui', 'notifications', 'security', 'data')),
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- MT5 Connections Table
CREATE TABLE IF NOT EXISTS mt5_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_name VARCHAR(100) NOT NULL,
    server VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL,
    encrypted_password TEXT NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('demo', 'live')),
    is_active BOOLEAN DEFAULT true,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    connection_status VARCHAR(20) DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login History Table
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location JSONB,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT true,
    failure_reason TEXT
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    device_info JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Backup Codes Table
CREATE TABLE IF NOT EXISTS backup_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Export Requests Table
CREATE TABLE IF NOT EXISTS export_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('full', 'trading_data', 'settings', 'personal_data')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_url TEXT,
    file_size BIGINT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_category ON user_settings(category);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_category ON user_settings(user_id, category);
CREATE INDEX IF NOT EXISTS idx_mt5_connections_user_id ON mt5_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_mt5_connections_active ON mt5_connections(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_backup_codes_user_id ON backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_codes_unused ON backup_codes(user_id) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_export_requests_user_id ON export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_export_requests_status ON export_requests(status);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt5_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mt5_connections
CREATE POLICY "Users can view own MT5 connections" ON mt5_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own MT5 connections" ON mt5_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MT5 connections" ON mt5_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own MT5 connections" ON mt5_connections
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for login_history
CREATE POLICY "Users can view own login history" ON login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history" ON login_history
    FOR INSERT WITH CHECK (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for backup_codes
CREATE POLICY "Users can view own backup codes" ON backup_codes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own backup codes" ON backup_codes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backup codes" ON backup_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backup codes" ON backup_codes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for export_requests
CREATE POLICY "Users can view own export requests" ON export_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own export requests" ON export_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update export requests" ON export_requests
    FOR UPDATE USING (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mt5_connections TO authenticated;
GRANT SELECT ON login_history TO authenticated;
GRANT INSERT ON login_history TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON backup_codes TO authenticated;
GRANT SELECT, INSERT ON export_requests TO authenticated;
GRANT UPDATE ON export_requests TO service_role;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (user_id, display_name, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NOW(),
        NOW()
    );
    
    -- Create default settings for all categories
    INSERT INTO public.user_settings (user_id, category, data, created_at, updated_at)
    VALUES 
        -- Trading Settings
        (NEW.id, 'trading', '{
            "defaultLotSize": 0.01,
            "maxRiskPerTrade": 2,
            "stopLossType": "percentage",
            "takeProfitType": "ratio",
            "autoCloseEnabled": false,
            "maxDailyLoss": 5,
            "maxOpenPositions": 10,
            "allowHedging": false,
            "confirmOrders": true,
            "oneClickTrading": false
        }', NOW(), NOW()),
        
        -- UI Settings
        (NEW.id, 'ui', '{
            "theme": "system",
            "language": "en",
            "timezone": "UTC",
            "dateFormat": "MM/DD/YYYY",
            "timeFormat": "12h",
            "chartTheme": "dark",
            "showGrid": true,
            "compactMode": false,
            "sidebarCollapsed": false,
            "showTooltips": true
        }', NOW(), NOW()),
        
        -- Notification Settings
        (NEW.id, 'notifications', '{
            "emailNotifications": {
                "tradeAlerts": true,
                "accountUpdates": true,
                "systemMessages": true,
                "marketNews": false,
                "weeklyReports": true
            },
            "pushNotifications": {
                "tradeAlerts": true,
                "priceAlerts": true,
                "systemMessages": true,
                "marketNews": false
            },
            "soundAlerts": {
                "enabled": true,
                "volume": 0.7,
                "tradeExecution": true,
                "priceAlerts": true,
                "errorAlerts": true
            },
            "alertFrequency": "immediate",
            "quietHours": {
                "enabled": false,
                "startTime": "22:00",
                "endTime": "08:00"
            }
        }', NOW(), NOW()),
        
        -- Security Settings
        (NEW.id, 'security', '{
            "twoFactorEnabled": false,
            "sessionTimeout": 30,
            "loginNotifications": true,
            "deviceTracking": true,
            "ipWhitelist": [],
            "autoLogout": true,
            "passwordExpiry": 90,
            "requirePasswordChange": false
        }', NOW(), NOW()),
        
        -- Data & Backup Settings
        (NEW.id, 'data', '{
            "autoBackup": {
                "enabled": true,
                "frequency": "weekly",
                "includeSettings": true,
                "includeTradingData": true,
                "includePersonalData": false
            },
            "dataRetention": {
                "tradingHistory": 365,
                "loginHistory": 90,
                "exportHistory": 30
            },
            "privacy": {
                "shareAnalytics": false,
                "shareUsageData": false,
                "allowMarketing": false
            },
            "exportFormat": "json",
            "compressionEnabled": true
        }', NOW(), NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mt5_connections_updated_at
    BEFORE UPDATE ON mt5_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old login history (keep last 1000 entries per user)
CREATE OR REPLACE FUNCTION cleanup_old_login_history()
RETURNS void AS $$
BEGIN
    DELETE FROM login_history
    WHERE id NOT IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_at DESC) as rn
            FROM login_history
        ) ranked
        WHERE rn <= 1000
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old export requests (keep for 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_export_requests()
RETURNS void AS $$
BEGIN
    DELETE FROM export_requests
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('completed', 'failed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;