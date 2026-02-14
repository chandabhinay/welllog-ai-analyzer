# System Architecture

## Overview

The Well Log Analysis System is a full-stack web application designed to ingest, store, visualize, and analyze subsurface well-log data from LAS files. The architecture follows modern best practices with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         React Application (Vite)                       │  │
│  │  - Home Page (Well List)                               │  │
│  │  - Well Viewer (Visualization, AI, Chatbot)            │  │
│  │  - Material-UI Components                              │  │
│  │  - Plotly.js Charts                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                            ↕ HTTP/REST                        │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer (API)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Express.js Server                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │ Well Routes  │  │ Data Routes  │  │  AI Routes   │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │   Chatbot    │  │  LAS Parser  │  │  Middleware  │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│           ↕                    ↕                    ↕         │
└─────────────────────────────────────────────────────────────┘
       │                    │                    │
       ↓                    ↓                    ↓
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │   AWS S3     │   │  OpenAI API  │
│   Database   │   │  (Storage)   │   │   (GPT-4)    │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Component Architecture

### Frontend Components

```
App.jsx (Root)
├── Layout.jsx (AppBar, Footer)
├── Home.jsx
│   └── WellCard (list view)
└── WellViewer.jsx
    ├── WellInfo.jsx (metadata display)
    ├── Visualization.jsx (Plotly charts)
    ├── AIInterpretation.jsx (AI analysis UI)
    └── Chatbot.jsx (conversational interface)
```

### Backend Structure

```
backend/
├── config/              # Configuration modules
│   ├── database.js      # Sequelize setup
│   ├── s3.js           # AWS S3 client
│   └── openai.js       # OpenAI client
├── models/             # Data models
│   ├── Well.js         # Well metadata
│   └── WellData.js     # Depth measurements
├── routes/             # API endpoints
│   ├── wellRoutes.js   # CRUD for wells
│   ├── dataRoutes.js   # Data queries
│   ├── aiRoutes.js     # AI interpretation
│   └── chatbotRoutes.js # Chatbot queries
├── utils/              # Utilities
│   └── lasParser.js    # LAS file parser
└── server.js           # Main application
```

## Data Flow

### 1. File Upload Flow

```
User selects LAS file
      ↓
Frontend sends multipart/form-data
      ↓
Backend receives file (Multer middleware)
      ↓
LAS Parser extracts:
  - Well metadata (header)
  - Curve definitions
  - Measurement data
      ↓
Original file → S3 (async)
      ↓
Well metadata → PostgreSQL Wells table
      ↓
Measurement data → PostgreSQL WellData table (batch insert)
      ↓
Success response to frontend
      ↓
Frontend updates well list
```

### 2. Visualization Flow

```
User selects curves + depth range
      ↓
Frontend sends POST /api/data/query
      ↓
Backend queries WellData table
  WHERE wellId = ? AND depth BETWEEN ? AND ?
      ↓
Filter to selected curves
      ↓
Return JSON data array
      ↓
Frontend transforms to Plotly format
  - Create trace per curve
  - Configure multi-axis layout
      ↓
Plotly renders interactive chart
```

### 3. AI Interpretation Flow

```
User selects curves + depth range
      ↓
Frontend sends POST /api/ai/interpret
      ↓
Backend queries data + calculates statistics
      ↓
Build contextual prompt with:
  - Well information
  - Statistical summary
  - Sample data points
      ↓
Send to OpenAI GPT-4 API
      ↓
Receive and parse interpretation
      ↓
Return formatted response
      ↓
Frontend displays with statistics
```

### 4. Chatbot Flow

```
User sends message
      ↓
Frontend sends POST /api/chatbot/query with history
      ↓
Backend builds context:
  - Well metadata
  - Available curves
  - Conversation history
      ↓
Send to OpenAI GPT-4 API
      ↓
Receive response
      ↓
Return to frontend
      ↓
Frontend appends to message history
```

## Database Schema

### Wells Table

```sql
CREATE TABLE wells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  well_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  field VARCHAR(255),
  location VARCHAR(255),
  country VARCHAR(255),
  state VARCHAR(255),
  uwi VARCHAR(255),
  api VARCHAR(255),
  start_depth FLOAT NOT NULL,
  stop_depth FLOAT NOT NULL,
  step FLOAT NOT NULL,
  null_value FLOAT DEFAULT -9999.0,
  date_analyzed TIMESTAMP,
  s3_file_url VARCHAR(500),
  s3_file_name VARCHAR(255),
  curves JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wells_created ON wells(created_at);
```

**Rationale:**
- UUID for globally unique identifiers
- JSONB for flexible curve storage (variable schemas)
- Denormalized metadata for performance
- S3 URL for original file reference

### WellData Table

```sql
CREATE TABLE well_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  well_id UUID NOT NULL REFERENCES wells(id),
  depth FLOAT NOT NULL,
  measurements JSONB NOT NULL
);

CREATE INDEX idx_welldata_well_depth ON well_data(well_id, depth);
CREATE INDEX idx_welldata_depth ON well_data(depth);
```

**Rationale:**
- JSONB for measurements allows flexible curve storage
- Composite index (well_id, depth) for efficient range queries
- Separate depth index for multi-well queries
- Denormalized for read performance

### Alternative Designs Considered

#### 1. Normalized Curve Table (Rejected)

```sql
-- NOT USED
CREATE TABLE curves (
  id UUID PRIMARY KEY,
  well_id UUID REFERENCES wells(id),
  name VARCHAR(50),
  unit VARCHAR(20)
);

CREATE TABLE measurements (
  id UUID PRIMARY KEY,
  curve_id UUID REFERENCES curves(id),
  depth FLOAT,
  value FLOAT
);
```

**Why rejected:**
- Requires JOIN for every query
- Inflexible for variable curve sets
- Larger storage footprint
- Complex queries for multi-curve visualization

#### 2. Wide Column Table (Rejected)

```sql
-- NOT USED
CREATE TABLE well_data (
  depth FLOAT,
  well_id UUID,
  hc1 FLOAT,
  hc2 FLOAT,
  -- ... 100+ columns
);
```

**Why rejected:**
- Schema changes for new curves
- Sparse data (many NULL values)
- Not scalable

## Design Decisions

### 1. JSONB for Measurements

**Pros:**
- Flexible schema
- Fast queries with GIN indexes
- Compact storage
- Easy to extend

**Cons:**
- Less type safety
- Requires application-level validation
- Cannot enforce FK constraints within JSONB

**Decision:** Benefits outweigh drawbacks for this use case

### 2. Batch Inserts for Well Data

```javascript
// Insert in batches of 1000
for (let i = 0; i < data.length; i += 1000) {
  const batch = data.slice(i, i + 1000);
  await WellData.bulkCreate(batch);
}
```

**Rationale:**
- Reduces database round trips
- Prevents memory overflow
- Improves upload performance
- Compromise between speed and memory

### 3. S3 for File Storage

**Alternatives:**
- Database BLOB storage
- Local filesystem

**Why S3:**
- Scalable and durable
- Cost-effective
- Separation of concerns
- CDN integration available
- Automatic backups

### 4. Plotly.js for Visualization

**Alternatives:**
- D3.js: More control but more code
- Chart.js: Simpler but less interactive
- Recharts: React-focused but limited features

**Why Plotly:**
- Interactive by default
- Multi-axis support
- Handles large datasets
- Professional appearance
- Good documentation

### 5. PostgreSQL over MongoDB

**Why PostgreSQL:**
- JSONB provides NoSQL flexibility
- ACID compliance for data integrity
- Better for structured + semi-structured data
- Mature ecosystem
- Strong query optimizer
- Better for time-series queries (depth-based)

**Why not MongoDB:**
- Well data has strong relational aspects
- Need for complex range queries
- ACID transactions important for uploads
- Team familiarity

### 6. Sequelize ORM

**Pros:**
- Abstracts database operations
- Migration support
- Model validation
- Cross-database compatibility

**Cons:**
- Learning curve
- Abstraction overhead
- Complex queries can be tricky

**Decision:** Benefits worth the tradeoffs for this project

### 7. Single API Server

**Alternative:** Microservices

**Why monolithic:**
- Simpler deployment
- Easier local development
- Sufficient for current scale
- Can refactor to microservices later

### 8. Client-Side Visualization

**Alternative:** Server-side rendering

**Why client-side:**
- Better interactivity
- Reduces server load
- Modern browsers handle it well
- Easier scaling

## Security Architecture

### 1. Credential Management
- Environment variables for secrets
- Never committed to repository
- Different per environment

### 2. API Security
- CORS configuration
- Input validation
- SQL injection prevention (ORM parameterization)
- File upload restrictions (type, size)

### 3. Storage Security
- S3 bucket not publicly accessible
- Pre-signed URLs for secure access (if needed)
- IAM roles with minimal permissions

### 4. Data Validation
- Frontend: Basic validation
- Backend: Comprehensive validation
- Database: Constraints and types

## Performance Considerations

### 1. Database
- Indexes on frequently queried columns
- JSONB GIN indexes for curve queries
- Connection pooling
- Batch operations

### 2. API
- Limit query results (max 10,000 points)
- Sampling for AI processing
- Async operations where possible

### 3. Frontend
- Code splitting with Vite
- Lazy loading components
- Efficient re-renders (React hooks)
- Plotly downsampling for large datasets

### 4. Caching Opportunities
- API response caching (Redis)
- S3 CloudFront CDN
- Browser caching for static assets

## Scalability

### Current Limitations
- Single server
- No load balancing
- No caching layer
- Synchronous file processing

### Scaling Strategies

#### Horizontal Scaling:
1. Multiple API servers behind load balancer
2. Shared PostgreSQL (or read replicas)
3. Redis for session/cache
4. Queue for file processing (SQS + Lambda)

#### Vertical Scaling:
1. Larger database instance
2. More API server resources
3. Database optimization (partitioning)

#### Future Enhancements:
- WebSocket for real-time updates
- Worker queue for heavy processing
- Caching layer (Redis)
- CDN for file delivery
- Database sharding for massive datasets

## Error Handling

### Frontend
- User-friendly error messages
- Graceful degradation
- Loading states
- Retry mechanisms

### Backend
- Try-catch blocks
- Centralized error middleware
- Logging
- Fallback responses (e.g., AI failures)

## Monitoring and Logging

### Backend Logging
- Request logging
- Error logging
- Database query logging (dev)
- Performance metrics

### Frontend Logging
- Console errors
- Network failures
- User actions (analytics)

### Production Monitoring
- Application monitoring (New Relic, DataDog)
- Database monitoring
- S3 metrics
- API response times

## Testing Strategy

### Unit Tests (Future)
- LAS parser
- API endpoints
- Utility functions

### Integration Tests
- API + Database
- File upload flow
- Data query accuracy

### E2E Tests
- User workflows
- Browser compatibility
- Mobile responsiveness

## Deployment Architecture

### Development
```
Local Machine → PostgreSQL Local → File System
```

### Production
```
CloudFront (CDN) → S3 (Frontend)
                     ↓
Load Balancer → EC2/EB (Backend) → RDS (Database)
                     ↓                ↓
                  S3 (Files)    OpenAI API
```

## API Versioning

Current: No versioning (v1 implicit)

Future: `/api/v1/...` structure for backward compatibility

## Documentation

- README.md: Overview and quick start
- SETUP_GUIDE.md: Detailed setup instructions
- DEPLOYMENT.md: Production deployment
- ARCHITECTURE.md: This document
- Code comments: Inline documentation
- API documentation: Could add Swagger/OpenAPI

## Future Improvements

### Short Term
- Add unit tests
- Implement caching
- Add user authentication
- Export functionality

### Long Term
- Multi-well comparison
- Advanced analytics
- Machine learning models
- Mobile app
- Collaboration features
- Real-time data streaming

## Conclusion

This architecture provides a solid foundation for a well-log analysis system with:
- Clear separation of concerns
- Scalability options
- Security best practices
- Modern technology stack
- Room for growth

The design prioritizes:
1. **Flexibility**: JSONB for variable schemas
2. **Performance**: Indexed queries, batch operations
3. **Maintainability**: Clear structure, documentation
4. **User Experience**: Interactive UI, AI assistance
5. **Production-Ready**: Security, error handling, scalability

---

**Architecture Version:** 1.0  
**Last Updated:** 2026-02-12
