import React, { useEffect, useCallback, useRef, useState } from 'react';

interface AudioAlert {
  type: 'order_fill' | 'stop_loss' | 'take_profit' | 'connection_lost' | 'connection_restored' | 'new_position' | 'position_closed' | 'error';
  enabled: boolean;
}

interface UseAudioAlertsProps {
  enabled?: boolean;
  volume?: number; // 0-1
}

export const useAudioAlerts = ({ enabled = true, volume = 0.5 }: UseAudioAlertsProps = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const alertsEnabledRef = useRef(enabled);
  const volumeRef = useRef(volume);

  // Update refs when props change
  useEffect(() => {
    alertsEnabledRef.current = enabled;
    volumeRef.current = volume;
  }, [enabled, volume]);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate different tones for different alert types
  const generateTone = useCallback((frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
    if (!audioContextRef.current || !alertsEnabledRef.current) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volumeRef.current * 0.3, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  }, []);

  // Generate chord (multiple frequencies)
  const generateChord = useCallback((frequencies: number[], duration: number) => {
    frequencies.forEach(freq => {
      generateTone(freq, duration, 'sine');
    });
  }, [generateTone]);

  // Play different alert sounds
  const playAlert = useCallback((alertType: AudioAlert['type']) => {
    if (!alertsEnabledRef.current) return;

    switch (alertType) {
      case 'order_fill':
        // Pleasant ascending chord
        setTimeout(() => generateTone(523, 0.15), 0);   // C5
        setTimeout(() => generateTone(659, 0.15), 50);  // E5
        setTimeout(() => generateTone(784, 0.2), 100);  // G5
        break;

      case 'stop_loss':
        // Warning descending tones
        setTimeout(() => generateTone(880, 0.2, 'square'), 0);   // A5
        setTimeout(() => generateTone(659, 0.2, 'square'), 150); // E5
        setTimeout(() => generateTone(523, 0.3, 'square'), 300); // C5
        break;

      case 'take_profit':
        // Success ascending tones
        setTimeout(() => generateTone(523, 0.1), 0);   // C5
        setTimeout(() => generateTone(659, 0.1), 80);  // E5
        setTimeout(() => generateTone(784, 0.1), 160); // G5
        setTimeout(() => generateTone(1047, 0.2), 240); // C6
        break;

      case 'connection_lost':
        // Alert - rapid beeps
        for (let i = 0; i < 3; i++) {
          setTimeout(() => generateTone(1000, 0.1, 'square'), i * 150);
        }
        break;

      case 'connection_restored':
        // Relief - soft ascending tone
        generateTone(440, 0.3, 'sine');
        setTimeout(() => generateTone(554, 0.3, 'sine'), 100);
        break;

      case 'new_position':
        // Notification - single pleasant tone
        generateTone(659, 0.2, 'sine');
        break;

      case 'position_closed':
        // Completion - double tone
        generateTone(523, 0.15, 'sine');
        setTimeout(() => generateTone(659, 0.15, 'sine'), 100);
        break;

      case 'error':
        // Error - harsh buzzer
        for (let i = 0; i < 2; i++) {
          setTimeout(() => generateTone(200, 0.2, 'square'), i * 250);
        }
        break;

      default:
        // Default notification
        generateTone(800, 0.15, 'sine');
        break;
    }
  }, [generateTone]);

  // Convenience methods for common alerts
  const alerts = {
    orderFilled: () => playAlert('order_fill'),
    stopLossHit: () => playAlert('stop_loss'),
    takeProfitHit: () => playAlert('take_profit'),
    connectionLost: () => playAlert('connection_lost'),
    connectionRestored: () => playAlert('connection_restored'),
    newPosition: () => playAlert('new_position'),
    positionClosed: () => playAlert('position_closed'),
    error: () => playAlert('error')
  };

  return {
    playAlert,
    alerts,
    isEnabled: alertsEnabledRef.current,
    volume: volumeRef.current
  };
};

// Hook for managing audio alert settings
export const useAudioAlertSettings = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    volume: 0.5,
    alerts: {
      order_fill: true,
      stop_loss: true,
      take_profit: true,
      connection_lost: true,
      connection_restored: true,
      new_position: true,
      position_closed: true,
      error: true
    }
  });

  const updateSetting = useCallback((key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateAlertSetting = useCallback((alertType: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        [alertType]: enabled
      }
    }));
  }, []);

  const toggleAllAlerts = useCallback((enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      enabled,
      alerts: Object.keys(prev.alerts).reduce((acc, key) => {
        acc[key] = enabled;
        return acc;
      }, {} as any)
    }));
  }, []);

  return {
    settings,
    updateSetting,
    updateAlertSetting,
    toggleAllAlerts
  };
};