import React, { useState } from 'react';
import { Menu, X, User, Bell, HelpCircle, LogOut, Shield, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileHamburgerMenuProps {
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  userProfile?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const MobileHamburgerMenu: React.FC<MobileHamburgerMenuProps> = ({
  onNavigate,
  onLogout,
  userProfile
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User, route: '/profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, route: '/notifications' },
    { id: 'security', label: 'Security', icon: Shield, route: '/security' },
    { id: 'appearance', label: 'Appearance', icon: Palette, route: '/appearance' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, route: '/help' },
  ];

  const handleMenuToggle = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([15]);
    }
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (route: string) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10]);
    }
    onNavigate(route);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([20]);
    }
    onLogout?.();
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <motion.button
        onClick={handleMenuToggle}
        className="fixed top-4 right-4 z-50 w-12 h-12 bg-gray-900/80 backdrop-blur-md rounded-full flex items-center justify-center border border-gray-700/50 safe-top"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X size={20} className="text-white" />
          ) : (
            <Menu size={20} className="text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 z-50 safe-top safe-bottom"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-700/50">
                {userProfile ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {userProfile.avatar ? (
                        <img 
                          src={userProfile.avatar} 
                          alt={userProfile.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {userProfile.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">
                        {userProfile.name}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Guest User</h3>
                      <p className="text-gray-400 text-sm">Not signed in</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="flex-1 py-4">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.route)}
                      className="w-full flex items-center space-x-3 px-6 py-4 text-left hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={20} className="text-gray-400" />
                      <span className="text-white font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700/50">
                {onLogout && (
                  <motion.button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={20} className="text-red-400" />
                    <span className="text-red-400 font-medium">Sign Out</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileHamburgerMenu;