# Backend Integration Guide

## Overview

This document provides comprehensive specifications for developing the backend API that integrates with the NusaNexus Trading Platform frontend. The frontend is built with React + TypeScript + Vite and expects specific API contracts and WebSocket events.

## Table of Contents

- [Environment Setup](#environment-setup)
- [API Specifications](#api-specifications)
- [WebSocket Events](#websocket-events)
- [Authentication Flow](#authentication-flow)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Security Requirements](#security-requirements)
- [Performance Requirements](#performance-requirements)
- [Testing Guidelines](#testing-guidelines)

## Environment Setup

### Required Environment Variables

The frontend expects these environment variables to be configured:

```bash
# Copy from .env.example and configure
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Recommended Backend Stack

- **Node.js** with Express/Fastify or **Python** with FastAPI
- **PostgreSQL** for primary database
- **Redis** for caching and session management
- **WebSocket** support for real-time data
- **JWT** for authentication
- **Docker** for containerization

## API Specifications

### Base Configuration

- **Base URL**: `http://localhost:8000` (development)
- **Content-Type**: `application/json`
- **Authentication**: Bearer JWT tokens
- **Timeout**: 30 seconds
- **Rate Limiting**: 100 requests/minute per user

### Standard Response Format

```typescript
// Success Response
{
  "success": true,
  "data": any,
  "message": string,
  "timestamp": string
}

// Error Response
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any
  },
  "timestamp": string
}

// Paginated Response
{
  "success": true,
  "data": any[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  },
  "timestamp": string
}
```

### Authentication Endpoints

#### POST /auth/login
```typescript
// Request
{
  "email": string,
  "password": string,
  "rememberMe"?: boolean
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": string,
      "email": string,
      "name": string,
      "role": "admin" | "trader" | "viewer",
      "preferences": object,
      "createdAt": string,
      "updatedAt": string
    },
    "accessToken": string,
    "refreshToken": string,
    "expiresIn": number
  }
}
```

#### POST /auth/refresh
```typescript
// Request
{
  "refreshToken": string
}

// Response
{
  "success": true,
  "data": {
    "accessToken": string,
    "refreshToken": string,
    "expiresIn": number
  }
}
```

#### GET /auth/me
```typescript
// Headers: Authorization: Bearer <token>
// Response
{
  "success": true,
  "data": {
    "id": string,
    "email": string,
    "name": string,
    "role": string,
    "preferences": object
  }
}
```

#### POST /auth/logout
```typescript
// Headers: Authorization: Bearer <token>
// Request
{
  "refreshToken": string
}

// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Trading Endpoints

#### GET /trading/orders
```typescript
// Query Parameters
{
  "page"?: number,
  "limit"?: number,
  "status"?: "pending" | "filled" | "cancelled" | "rejected",
  "symbol"?: string,
  "startDate"?: string,
  "endDate"?: string
}

// Response
{
  "success": true,
  "data": [
    {
      "id": string,
      "symbol": string,
      "type": "market" | "limit" | "stop" | "stop_limit",
      "side": "buy" | "sell",
      "quantity": number,
      "price": number,
      "stopPrice": number,
      "status": "pending" | "filled" | "cancelled" | "rejected",
      "filledQuantity": number,
      "averagePrice": number,
      "createdAt": string,
      "updatedAt": string
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

#### POST /trading/orders
```typescript
// Request
{
  "symbol": string,
  "type": "market" | "limit" | "stop" | "stop_limit",
  "side": "buy" | "sell",
  "quantity": number,
  "price"?: number,
  "stopPrice"?: number,
  "timeInForce"?: "GTC" | "IOC" | "FOK",
  "clientOrderId"?: string
}

// Response
{
  "success": true,
  "data": {
    "id": string,
    "symbol": string,
    "type": string,
    "side": string,
    "quantity": number,
    "price": number,
    "status": "pending",
    "createdAt": string
  }
}
```

#### PUT /trading/orders/:id
```typescript
// Request
{
  "quantity"?: number,
  "price"?: number,
  "stopPrice"?: number
}

// Response
{
  "success": true,
  "data": {
    "id": string,
    "symbol": string,
    "type": string,
    "side": string,
    "quantity": number,
    "price": number,
    "status": string,
    "updatedAt": string
  }
}
```

#### DELETE /trading/orders/:id
```typescript
// Response
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": string,
    "status": "cancelled",
    "cancelledAt": string
  }
}
```

#### GET /trading/positions
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": string,
      "symbol": string,
      "side": "long" | "short",
      "quantity": number,
      "averagePrice": number,
      "currentPrice": number,
      "unrealizedPnL": number,
      "realizedPnL": number,
      "marginUsed": number,
      "createdAt": string,
      "updatedAt": string
    }
  ]
}
```

#### GET /trading/portfolio
```typescript
// Response
{
  "success": true,
  "data": {
    "totalValue": number,
    "availableBalance": number,
    "marginUsed": number,
    "unrealizedPnL": number,
    "realizedPnL": number,
    "totalPnL": number,
    "dayPnL": number,
    "positions": number,
    "openOrders": number,
    "performance": {
      "daily": number,
      "weekly": number,
      "monthly": number,
      "yearly": number
    }
  }
}
```

### Market Data Endpoints

#### GET /market/data
```typescript
// Query Parameters
{
  "symbol": string,
  "interval"?: "1m" | "5m" | "15m" | "1h" | "4h" | "1d",
  "limit"?: number,
  "startTime"?: string,
  "endTime"?: string
}

// Response
{
  "success": true,
  "data": {
    "symbol": string,
    "interval": string,
    "data": [
      {
        "timestamp": string,
        "open": number,
        "high": number,
        "low": number,
        "close": number,
        "volume": number
      }
    ]
  }
}
```

#### GET /market/symbols
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "symbol": string,
      "name": string,
      "type": "forex" | "crypto" | "stock" | "commodity",
      "baseAsset": string,
      "quoteAsset": string,
      "minQuantity": number,
      "maxQuantity": number,
      "tickSize": number,
      "active": boolean
    }
  ]
}
```

### Strategy Endpoints

#### GET /strategies
```typescript
// Response
{
  "success": true,
  "data": [
    {
      "id": string,
      "name": string,
      "description": string,
      "type": "manual" | "automated",
      "status": "active" | "inactive" | "paused",
      "symbols": string[],
      "riskManagement": {
        "maxRiskPerTrade": number,
        "maxDailyLoss": number,
        "stopLoss": number,
        "takeProfit": number
      },
      "performance": {
        "totalTrades": number,
        "winRate": number,
        "totalPnL": number,
        "sharpeRatio": number
      },
      "createdAt": string,
      "updatedAt": string
    }
  ]
}
```

#### POST /strategies
```typescript
// Request
{
  "name": string,
  "description": string,
  "type": "manual" | "automated",
  "symbols": string[],
  "riskManagement": {
    "maxRiskPerTrade": number,
    "maxDailyLoss": number,
    "stopLoss": number,
    "takeProfit": number
  },
  "parameters": object
}

// Response
{
  "success": true,
  "data": {
    "id": string,
    "name": string,
    "status": "inactive",
    "createdAt": string
  }
}
```

### AI Analysis Endpoints

#### POST /ai/analysis
```typescript
// Request
{
  "symbol": string,
  "analysisType": "trend" | "support_resistance" | "pattern" | "sentiment",
  "timeframe": "1h" | "4h" | "1d" | "1w",
  "parameters": object
}

// Response
{
  "success": true,
  "data": {
    "symbol": string,
    "analysisType": string,
    "timeframe": string,
    "confidence": number,
    "signal": "buy" | "sell" | "hold",
    "analysis": {
      "trend": {
        "direction": "bullish" | "bearish" | "sideways",
        "strength": number
      },
      "supportResistance": {
        "support": number[],
        "resistance": number[]
      },
      "patterns": string[],
      "sentiment": {
        "score": number,
        "label": "positive" | "negative" | "neutral"
      }
    },
    "recommendations": [
      {
        "action": "buy" | "sell" | "hold",
        "price": number,
        "confidence": number,
        "reasoning": string
      }
    ],
    "generatedAt": string
  }
}
```

#### GET /ai/recommendations
```typescript
// Query Parameters
{
  "symbol"?: string,
  "limit"?: number
}

// Response
{
  "success": true,
  "data": [
    {
      "id": string,
      "symbol": string,
      "action": "buy" | "sell" | "hold",
      "price": number,
      "confidence": number,
      "reasoning": string,
      "status": "active" | "executed" | "expired",
      "createdAt": string,
      "expiresAt": string
    }
  ]
}
```

## WebSocket Events

### Connection

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws');

// Authentication after connection
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt-token-here'
}));
```

### Event Format

```typescript
{
  "type": string,
  "data": any,
  "timestamp": string,
  "channel"?: string
}
```

### Subscription Management

```typescript
// Subscribe to price updates
{
  "type": "subscribe",
  "channel": "price_updates",
  "symbols": ["EURUSD", "GBPUSD"]
}

// Unsubscribe
{
  "type": "unsubscribe",
  "channel": "price_updates",
  "symbols": ["EURUSD"]
}
```

### Event Types

#### price_update
```typescript
{
  "type": "price_update",
  "data": {
    "symbol": string,
    "bid": number,
    "ask": number,
    "last": number,
    "change": number,
    "changePercent": number,
    "volume": number,
    "timestamp": string
  }
}
```

#### order_update
```typescript
{
  "type": "order_update",
  "data": {
    "id": string,
    "symbol": string,
    "status": "pending" | "filled" | "cancelled" | "rejected",
    "filledQuantity": number,
    "averagePrice": number,
    "updatedAt": string
  }
}
```

#### position_update
```typescript
{
  "type": "position_update",
  "data": {
    "id": string,
    "symbol": string,
    "quantity": number,
    "currentPrice": number,
    "unrealizedPnL": number,
    "updatedAt": string
  }
}
```

#### portfolio_update
```typescript
{
  "type": "portfolio_update",
  "data": {
    "totalValue": number,
    "availableBalance": number,
    "unrealizedPnL": number,
    "dayPnL": number,
    "updatedAt": string
  }
}
```

#### market_news
```typescript
{
  "type": "market_news",
  "data": {
    "id": string,
    "title": string,
    "content": string,
    "source": string,
    "impact": "high" | "medium" | "low",
    "symbols": string[],
    "publishedAt": string
  }
}
```

#### ai_signal
```typescript
{
  "type": "ai_signal",
  "data": {
    "symbol": string,
    "signal": "buy" | "sell" | "hold",
    "confidence": number,
    "reasoning": string,
    "price": number,
    "generatedAt": string
  }
}
```

## Authentication Flow

1. **Login**: POST /auth/login → Returns access & refresh tokens
2. **API Requests**: Include `Authorization: Bearer <accessToken>` header
3. **Token Refresh**: When 401 received, POST /auth/refresh with refreshToken
4. **Logout**: POST /auth/logout to invalidate tokens

### Token Management

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens
- **Storage**: localStorage for tokens (frontend handles this)
- **Validation**: JWT with proper expiration and signature verification

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'trader' | 'viewer';
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity: number;
  averagePrice?: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  clientOrderId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Position
```typescript
interface Position {
  id: string;
  userId: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  marginUsed: number;
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

### Error Codes

- `AUTHENTICATION_ERROR`: Invalid or expired token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND_ERROR`: Resource not found
- `RATE_LIMIT_ERROR`: Too many requests
- `TRADING_ERROR`: Trading-specific errors
- `MARKET_CLOSED_ERROR`: Market is closed
- `INSUFFICIENT_BALANCE_ERROR`: Not enough balance
- `INTERNAL_SERVER_ERROR`: Server error

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `429`: Rate Limited
- `500`: Internal Server Error
- `503`: Service Unavailable

## Security Requirements

### Authentication
- JWT tokens with proper expiration
- Refresh token rotation
- Rate limiting per user/IP
- Password hashing (bcrypt/argon2)

### API Security
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- HTTPS in production

### Trading Security
- Order validation (balance, limits)
- Risk management checks
- Audit logging for all trades
- Position size limits

## Performance Requirements

### Response Times
- Authentication: < 200ms
- Trading operations: < 100ms
- Market data: < 50ms
- Portfolio data: < 300ms

### WebSocket
- Price updates: < 10ms latency
- Connection recovery: < 5 seconds
- Message queuing during disconnection

### Database
- Connection pooling
- Query optimization
- Proper indexing
- Caching for frequently accessed data

## Testing Guidelines

### Unit Tests
- All API endpoints
- Authentication logic
- Trading calculations
- Risk management rules

### Integration Tests
- Database operations
- External API integrations
- WebSocket connections
- End-to-end trading flows

### Load Testing
- Concurrent user handling
- WebSocket connection limits
- Database performance under load
- API rate limiting

### Test Data
- Use separate test database
- Mock external services
- Test with various market conditions
- Edge cases and error scenarios

## Development Checklist

### Phase 1: Core API
- [ ] Authentication endpoints
- [ ] User management
- [ ] Basic trading endpoints
- [ ] Error handling
- [ ] Database setup

### Phase 2: Trading Features
- [ ] Order management
- [ ] Position tracking
- [ ] Portfolio calculations
- [ ] Risk management
- [ ] Market data integration

### Phase 3: Real-time Features
- [ ] WebSocket implementation
- [ ] Price streaming
- [ ] Order/position updates
- [ ] Connection management
- [ ] Message queuing

### Phase 4: Advanced Features
- [ ] Strategy management
- [ ] AI analysis integration
- [ ] Performance analytics
- [ ] Notification system
- [ ] Audit logging

### Phase 5: Production Ready
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Monitoring and logging
- [ ] Documentation
- [ ] Deployment setup

## Support

For questions about frontend integration:
- Check the TypeScript interfaces in `src/types/api.ts`
- Review API client implementation in `src/services/apiClient.ts`
- Test WebSocket events with `src/services/websocketManager.ts`
- Refer to component usage in `src/components/` and `src/pages/`

---

**Note**: This document should be updated as the backend implementation progresses. Always ensure API contracts match the TypeScript interfaces defined in the frontend codebase.