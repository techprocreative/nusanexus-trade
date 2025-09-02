-- Mobile Optimization Database Schema
-- This migration creates tables for mobile-specific features including device management,
-- user sessions, mobile preferences, and push notifications

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Device Management Table
-- Stores information about user devices for PWA and mobile app functionality
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) UNIQUE NOT NULL, -- Unique device identifier
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'pwa')),
    device_name VARCHAR(255), -- User-friendly device name
    platform VARCHAR(50), -- iOS, Android, Windows, macOS, Linux
    browser VARCHAR(100), -- Chrome, Safari, Firefox, etc.
    user_agent TEXT,
    screen_resolution VARCHAR(20), -- e.g., "1920x1080"
    is_pwa_installed BOOLEAN DEFAULT FALSE,
    push_subscription JSONB, -- Web Push subscription details
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile User Sessions Table
-- Enhanced session management for mobile devices with offline capabilities
CREATE TABLE IF NOT EXISTS mobile_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES user_devices(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    location JSONB, -- {"country": "ID", "city": "Jakarta", "lat": -6.2, "lng": 106.8}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile User Preferences Table
-- Stores mobile-specific user preferences and settings
CREATE TABLE IF NOT EXISTS mobile_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES user_devices(id) ON DELETE CASCADE,
    
    -- Display Preferences
    theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
    font_size VARCHAR(20) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'extra-large')),
    chart_style VARCHAR(20) DEFAULT 'candlestick' CHECK (chart_style IN ('line', 'candlestick', 'bar')),
    
    -- Notification Preferences
    push_notifications BOOLEAN DEFAULT TRUE,
    price_alerts BOOLEAN DEFAULT TRUE,
    order_notifications BOOLEAN DEFAULT TRUE,
    news_notifications BOOLEAN DEFAULT FALSE,
    marketing_notifications BOOLEAN DEFAULT FALSE,
    
    -- Trading Preferences
    default_order_type VARCHAR(20) DEFAULT 'market' CHECK (default_order_type IN ('market', 'limit', 'stop')),
    confirmation_dialogs BOOLEAN DEFAULT TRUE,
    biometric_auth BOOLEAN DEFAULT FALSE,
    quick_trade_amounts JSONB DEFAULT '[50, 100, 250, 500, 1000]'::jsonb,
    
    -- Haptic Feedback Settings
    haptic_feedback BOOLEAN DEFAULT TRUE,
    haptic_intensity VARCHAR(20) DEFAULT 'medium' CHECK (haptic_intensity IN ('light', 'medium', 'strong')),
    
    -- Performance Settings
    auto_refresh_interval INTEGER DEFAULT 5000, -- milliseconds
    offline_mode BOOLEAN DEFAULT TRUE,
    data_saver_mode BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, device_id)
);

-- Push Notifications Table
-- Manages push notification history and delivery status
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    icon_url VARCHAR(500),
    image_url VARCHAR(500),
    click_action VARCHAR(500), -- URL to open when clicked
    
    -- Notification Type and Priority
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'price_alert', 'order_filled', 'order_cancelled', 'margin_call', 
        'news', 'system', 'marketing', 'security'
    )),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Delivery Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'clicked')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Metadata
    data JSONB, -- Additional notification data
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile App Analytics Table
-- Tracks mobile-specific user interactions and performance metrics
CREATE TABLE IF NOT EXISTS mobile_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES user_devices(id) ON DELETE CASCADE,
    session_id UUID REFERENCES mobile_sessions(id) ON DELETE SET NULL,
    
    -- Event Information
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'trade_executed', 'gesture_used', etc.
    event_category VARCHAR(50), -- 'navigation', 'trading', 'ui_interaction'
    event_data JSONB, -- Flexible event-specific data
    
    -- Performance Metrics
    page_load_time INTEGER, -- milliseconds
    network_type VARCHAR(20), -- '4g', 'wifi', 'offline'
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    
    -- Location and Context
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    viewport_size VARCHAR(20), -- e.g., "375x812"
    orientation VARCHAR(20) CHECK (orientation IN ('portrait', 'landscape')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offline Data Cache Table
-- Stores cached data for offline functionality
CREATE TABLE IF NOT EXISTS offline_data_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cache_key VARCHAR(255) NOT NULL,
    cache_data JSONB NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- 'portfolio', 'positions', 'market_data', etc.
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, cache_key)
);

-- Pending Mobile Actions Table
-- Stores actions performed while offline to be synced when online
CREATE TABLE IF NOT EXISTS pending_mobile_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES user_devices(id) ON DELETE CASCADE,
    
    action_type VARCHAR(50) NOT NULL, -- 'place_order', 'cancel_order', 'update_preferences'
    action_data JSONB NOT NULL,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_type ON user_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_user_devices_last_active ON user_devices(last_active_at);

CREATE INDEX IF NOT EXISTS idx_mobile_sessions_user_id ON mobile_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_device_id ON mobile_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_active ON mobile_sessions(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_mobile_preferences_user_id ON mobile_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_preferences_device_id ON mobile_preferences(device_id);

CREATE INDEX IF NOT EXISTS idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_type ON push_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_created_at ON push_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_mobile_analytics_user_id ON mobile_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_analytics_event_type ON mobile_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_mobile_analytics_created_at ON mobile_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_offline_cache_user_id ON offline_data_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_cache_key ON offline_data_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_offline_cache_expires ON offline_data_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_pending_actions_user_id ON pending_mobile_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_actions_status ON pending_mobile_actions(status);
CREATE INDEX IF NOT EXISTS idx_pending_actions_created_at ON pending_mobile_actions(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_devices_updated_at BEFORE UPDATE ON user_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_preferences_updated_at BEFORE UPDATE ON mobile_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offline_cache_updated_at BEFORE UPDATE ON offline_data_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_mobile_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- User Devices Policies
CREATE POLICY "Users can view their own devices" ON user_devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON user_devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON user_devices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" ON user_devices
    FOR DELETE USING (auth.uid() = user_id);

-- Mobile Sessions Policies
CREATE POLICY "Users can view their own sessions" ON mobile_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON mobile_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON mobile_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Mobile Preferences Policies
CREATE POLICY "Users can view their own preferences" ON mobile_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON mobile_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON mobile_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Push Notifications Policies
CREATE POLICY "Users can view their own notifications" ON push_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON push_notifications
    FOR INSERT WITH CHECK (true); -- Allow system to insert notifications

CREATE POLICY "Users can update notification status" ON push_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Mobile Analytics Policies
CREATE POLICY "Users can view their own analytics" ON mobile_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON mobile_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Offline Data Cache Policies
CREATE POLICY "Users can manage their own cache" ON offline_data_cache
    FOR ALL USING (auth.uid() = user_id);

-- Pending Mobile Actions Policies
CREATE POLICY "Users can manage their own pending actions" ON pending_mobile_actions
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON user_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mobile_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON offline_data_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pending_mobile_actions TO authenticated;

-- Grant limited permissions to anon role for device registration
GRANT SELECT, INSERT ON user_devices TO anon;
GRANT SELECT, INSERT ON mobile_sessions TO anon;

-- Create helper functions

-- Function to register a new device
CREATE OR REPLACE FUNCTION register_mobile_device(
    p_device_id VARCHAR(255),
    p_device_type VARCHAR(50),
    p_device_name VARCHAR(255) DEFAULT NULL,
    p_platform VARCHAR(50) DEFAULT NULL,
    p_browser VARCHAR(100) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_screen_resolution VARCHAR(20) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    device_uuid UUID;
BEGIN
    INSERT INTO user_devices (
        user_id, device_id, device_type, device_name, platform, 
        browser, user_agent, screen_resolution
    ) VALUES (
        auth.uid(), p_device_id, p_device_type, p_device_name, p_platform,
        p_browser, p_user_agent, p_screen_resolution
    )
    ON CONFLICT (device_id) DO UPDATE SET
        last_active_at = NOW(),
        device_name = COALESCE(EXCLUDED.device_name, user_devices.device_name),
        platform = COALESCE(EXCLUDED.platform, user_devices.platform),
        browser = COALESCE(EXCLUDED.browser, user_devices.browser),
        user_agent = COALESCE(EXCLUDED.user_agent, user_devices.user_agent),
        screen_resolution = COALESCE(EXCLUDED.screen_resolution, user_devices.screen_resolution)
    RETURNING id INTO device_uuid;
    
    RETURN device_uuid;
END;
$$;

-- Function to update device activity
CREATE OR REPLACE FUNCTION update_device_activity(p_device_id VARCHAR(255))
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE user_devices 
    SET last_active_at = NOW() 
    WHERE device_id = p_device_id AND user_id = auth.uid();
END;
$$;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM mobile_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to clean up old analytics data (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM mobile_analytics WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

COMMIT;