// Remote configuration for API endpoints and feature flags
// Used to dynamically configure the application based on deployment environment

const remoteConfig = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.NEXT_PUBLIC_API_BASE || '/api',
    timeout: 30000, // 30 seconds
  },
  
  // Feature Flags
  features: {
    enableGamification: true,
    enableLeaderboard: true,
    enableRewards: true,
    enableReservations: true,
    enableShop: true,
  },
  
  // Image Configuration
  images: {
    placeholderService: 'placehold.co',
    placeholderBaseColor: '4F46E5',
    placeholderTextColor: 'FFFFFF',
    useVercelProxy: true,
  },
  
  // Payment Configuration
  payments: {
    kkiapay: {
      publicKey: import.meta.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '072b361d25546db0aee3d69bf07b15331c51e39f',
      sandbox: import.meta.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === '1' || false,
    }
  }
};

export default remoteConfig;