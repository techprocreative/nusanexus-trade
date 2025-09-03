# NusaNexus Trading Platform - Frontend

A modern, responsive trading platform frontend built with React, TypeScript, and Vite. This application provides a comprehensive trading interface with real-time market data, portfolio management, AI-powered analysis, and advanced trading features.

## 🚀 Features

- **Real-time Trading**: Live market data and order execution
- **Portfolio Management**: Comprehensive portfolio tracking and analytics
- **AI Analysis**: Intelligent market analysis and trading recommendations
- **Trading Strategies**: Automated trading strategy management
- **Risk Management**: Advanced risk controls and position management
- **Multi-asset Support**: Stocks, crypto, forex, and commodities
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: Customizable UI themes

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Charts**: Recharts + TradingView widgets
- **Real-time**: WebSocket connections
- **HTTP Client**: Axios with interceptors
- **Testing**: Vitest + React Testing Library

## 📋 Prerequisites

- Node.js 18+ and pnpm (or npm)
- Backend API server (separate repository)
- Environment variables configured

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd nusanexus-trading
pnpm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# External Services
VITE_TRADINGVIEW_WIDGET_ID=your_tradingview_id
VITE_NEWS_API_KEY=your_news_api_key

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ADVANCED_CHARTS=true
```

### 3. Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## 🔧 Backend Integration

This frontend is designed to work with a separate backend API. For backend development:

1. **API Documentation**: See `BACKEND_INTEGRATION.md` for complete API specifications
2. **Environment Variables**: All required variables are listed in `.env.example`
3. **Type Contracts**: TypeScript interfaces in `src/types/api.ts` define the API contracts
4. **WebSocket Events**: Real-time event specifications in the integration guide

### Backend Requirements

- RESTful API endpoints for all trading operations
- WebSocket server for real-time data
- JWT-based authentication
- CORS configuration for frontend domain

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── charts/         # Trading charts and visualizations
│   ├── trading/        # Trading-specific components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── apiClient.ts    # HTTP client configuration
│   ├── websocketManager.ts # WebSocket management
│   └── utils.ts        # Helper functions
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── styles/             # Global styles and themes
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 🏗️ Building for Production

```bash
# Build the application
pnpm build

# Preview the build
pnpm preview

# Type checking
pnpm type-check
```

## 🔍 Code Quality

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## 📚 Development Guidelines

### Component Development
- Keep components under 300 lines
- Use TypeScript for all components
- Follow the established folder structure
- Implement responsive design by default

### State Management
- Use Zustand for global state
- Keep state close to where it's used
- Implement proper error handling

### API Integration
- All API calls go through `apiClient.ts`
- Use TypeScript interfaces from `types/api.ts`
- Implement proper error handling and loading states
- Use WebSocket for real-time data

### Styling
- Use Tailwind CSS utility classes
- Follow the design system in `components/ui/`
- Implement dark/light theme support
- Ensure mobile responsiveness

## 🚀 Deployment

The application is configured for deployment on Vercel:

```bash
# Deploy to Vercel
vercel --prod
```

Make sure to configure environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions and support:
- Check the `BACKEND_INTEGRATION.md` for API specifications
- Review the component documentation in `/src/components`
- Open an issue for bugs or feature requests
