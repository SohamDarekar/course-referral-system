# 📐 System Design Documentation

## Overview

This document provides a detailed technical explanation of the Course Store Referral System architecture, data flow, and design decisions.

## Architecture Pattern

The application follows a **Client-Server Architecture** with a clear separation between:

1. **Presentation Layer** (Next.js Frontend)
2. **Business Logic Layer** (Express.js Backend)
3. **Data Layer** (MongoDB)

### Why This Architecture?

- **Separation of Concerns:** Frontend focuses on UI/UX, backend handles business logic
- **Independent Scaling:** Can scale frontend and backend separately
- **Technology Flexibility:** Easy to replace either layer if needed
- **Security:** Sensitive operations happen on the server

## Data Flow

### 1. Registration with Referral Flow

```
User Browser → Frontend
     ↓
Parse URL (?r=CODE)
     ↓
Submit Form → POST /api/auth/register {email, password, referrerCode}
     ↓
Backend Receives Request
     ↓
Validate Input (Zod)
     ↓
Hash Password (bcryptjs)
     ↓
Generate Unique Referral Code (nanoid)
     ↓
Lookup Referrer by referralCode
     ↓
Create User Document {referredBy: referrer._id}
     ↓
Generate JWT Token
     ↓
Return {user, token} → Frontend
     ↓
Store JWT in NextAuth Session
```

### 2. Purchase with Credit Award Flow

```
User Clicks "Buy Course"
     ↓
Frontend → POST /api/courses/:id/purchase (with JWT)
     ↓
Backend: Verify JWT → Extract userId
     ↓
Start MongoDB Transaction (ACID)
     ↓
Find User by userId (with session lock)
     ↓
Check hasConverted Flag
     ↓
IF hasConverted = false:
    │
    ├─ Set hasConverted = true
    ├─ user.credits += 2
    ├─ Save User (within transaction)
    │
    └─ IF referredBy exists:
        │
        ├─ Find Referrer
        ├─ referrer.credits += 2
        └─ Save Referrer (within transaction)
     ↓
ELSE: Skip credit logic
     ↓
Commit Transaction
     ↓
Return Result → Frontend
     ↓
Show Notification
```

## Database Schema Design

### User Collection

```typescript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed),
  referralCode: String (unique, indexed),
  referredBy: ObjectId | null (references User._id),
  credits: Number (default: 0),
  hasConverted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `username`: Unique index for fast lookup during login
- `email`: Unique index for registration validation
- `referralCode`: Unique index for referral link validation
- `referredBy`: Index for dashboard statistics queries

**Design Rationale:**

1. **`referralCode` as String:**
   - Generated using nanoid (8 characters, alphanumeric)
   - More user-friendly than ObjectId
   - URL-safe

2. **`referredBy` as ObjectId:**
   - Direct reference to referrer
   - Enables efficient joins/population
   - Nullable (users without referrer)

3. **`hasConverted` Boolean:**
   - Single source of truth for conversion status
   - Prevents complex time-based queries
   - Atomic update with transactions

4. **`credits` as Number:**
   - Simple counter
   - Can be extended to track credit history later

### Course Collection

```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Note:** In a production system, you'd add:
- `purchases: [ObjectId]` to track who bought what
- `category`, `instructor`, `thumbnail`, etc.

## Authentication & Authorization

### JWT-Based Authentication

```
Registration/Login
     ↓
Backend generates JWT:
{
  payload: { userId: user._id },
  secret: process.env.JWT_SECRET,
  expiresIn: '7d'
}
     ↓
Frontend stores in NextAuth session
     ↓
Every API request includes:
Authorization: Bearer <JWT>
     ↓
Backend middleware verifies JWT
     ↓
Extracts userId → Attaches to req.userId
     ↓
Route handler uses req.userId
```

### Why JWT?

- **Stateless:** No server-side session storage needed
- **Scalable:** Works across multiple servers
- **Self-contained:** All user info in token
- **Standard:** Widely supported

### NextAuth Integration

NextAuth bridges the Express backend with Next.js:

1. **CredentialsProvider** calls Express `/api/auth/login`
2. **jwt callback** stores JWT from Express
3. **session callback** includes JWT in client session
4. **Frontend** reads JWT from session and sends to Express

## The `hasConverted` Flag: Core Innovation

### Problem

How do you ensure credits are awarded **exactly once** per user, even with:
- Concurrent requests
- Database failures
- Multiple purchase attempts

### Solution: Boolean Flag + Atomic Transactions

```typescript
// Atomic operation within MongoDB transaction
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Lock user document
  const user = await User.findById(userId).session(session);
  
  if (!user.hasConverted) {
    // Award credits only on first purchase
    user.hasConverted = true;
    user.credits += 2;
    
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy).session(session);
      referrer.credits += 2;
      await referrer.save({ session });
    }
    
    await user.save({ session });
  }
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

### Why This Works

1. **Transaction Isolation:** MongoDB locks documents during transaction
2. **Atomic Check-and-Set:** Read hasConverted → Update if false
3. **ACID Compliance:** Either both users get credits or neither does
4. **Idempotent:** Safe to retry - flag prevents double-award

### Alternative Approaches (and why we didn't use them)

**❌ Time-based tracking:**
```typescript
firstPurchaseAt: Date | null
```
- Problem: What if purchase fails after setting date?
- Problem: Race condition if two requests hit simultaneously

**❌ Separate conversions table:**
```typescript
Conversions: {userId, referrerId, creditsAwarded, date}
```
- Problem: More complex queries
- Problem: Data duplication
- Problem: Requires join operations

**✅ Boolean flag:**
- Simple
- Fast
- Reliable
- Atomic

## API Design Principles

### RESTful Endpoints

```
POST   /api/auth/register       - Create user
POST   /api/auth/login          - Authenticate user
GET    /api/courses             - List courses
POST   /api/courses/:id/purchase - Purchase course
GET    /api/dashboard/stats     - Get user stats
```

### Error Handling

Consistent error response format:

```json
{
  "error": "Human-readable message",
  "details": [...] // Optional: validation errors
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

### Input Validation

**Client-side (React Hook Form + Zod):**
- Immediate feedback
- Better UX
- Reduces unnecessary requests

**Server-side (Zod):**
- Security (never trust client)
- Consistent validation logic
- Type safety

## Frontend Architecture

### Next.js App Router

```
app/
├── api/auth/[...nextauth]/  # NextAuth route handler
├── dashboard/               # Protected route
├── login/                   # Public route
├── register/                # Public route (with ?r param)
└── page.tsx                 # Home/store page
```

### State Management

**NextAuth Session (Global Auth State):**
```typescript
const { data: session } = useSession();
// Contains: user data + JWT token
```

**Zustand (UI State):**
```typescript
useNotificationStore: {
  message, type, show,
  showNotification(), hideNotification()
}

useLoadingStore: {
  isLoading,
  setLoading()
}
```

**Why Zustand?**
- Lightweight (1KB)
- No boilerplate
- React hooks API
- No context provider needed

### Component Organization

```
components/
├── courses/
│   └── CourseCard.tsx        # Reusable course display
├── layout/
│   └── Navbar.tsx            # Navigation with auth state
├── providers/
│   └── AuthProvider.tsx      # NextAuth session wrapper
└── ui/
    └── Notification.tsx      # Toast notifications
```

## Security Measures

### 1. Password Security
```typescript
// Registration
const hashedPassword = await bcrypt.hash(password, 12);
// 12 salt rounds = strong protection

// Login
const isValid = await bcrypt.compare(password, user.password);
```

### 2. JWT Security
```typescript
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
// Signed with secret, auto-expires
```

### 3. Environment Variables
```bash
# Never commit .env files
# All secrets in environment
JWT_SECRET=...
MONGO_URI=...
NEXTAUTH_SECRET=...
```

### 4. CORS Protection
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
// Only allow requests from frontend
```

### 5. Input Validation
```typescript
// Zod schema prevents injection
const registerSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6)
});
```

## Performance Optimizations

### Database Indexes

```typescript
// User model
username: { type: String, unique: true, index: true }
email: { type: String, unique: true, index: true }
referralCode: { type: String, unique: true, index: true }
referredBy: { type: ObjectId, ref: 'User', index: true }
```

**Impact:**
- Login queries: O(1) instead of O(n)
- Referral lookup: O(1) instead of O(n)
- Dashboard stats: O(log n) instead of O(n)

### Frontend Optimizations

1. **Code Splitting:** Next.js automatic
2. **Image Optimization:** next/image (not used in this project)
3. **Lazy Loading:** Framer Motion animations
4. **Memoization:** React hooks (useMemo, useCallback where needed)

### API Response Caching

```typescript
// Future enhancement:
GET /api/courses
Cache-Control: public, max-age=3600
// Cache course list for 1 hour
```

## Scalability Considerations

### Current Limitations

1. **Single MongoDB Instance:** No replication
2. **No Caching Layer:** Every request hits database
3. **No Message Queue:** Synchronous credit awards
4. **No CDN:** Static assets served by Next.js

### How to Scale

**Phase 1: Vertical Scaling**
- Increase server resources
- Add database indexes (already done)
- Enable MongoDB replica set

**Phase 2: Horizontal Scaling**
- Load balancer → Multiple Express instances
- Shared session store (Redis)
- Database read replicas

**Phase 3: Microservices**
- Auth service
- Courses service
- Referral service
- Event-driven architecture (Kafka/RabbitMQ)

**Phase 4: Global Scale**
- CDN for static assets (CloudFront, Cloudflare)
- Database sharding
- Multi-region deployment
- Caching layer (Redis, Memcached)

## Monitoring & Observability

### Recommended Additions

```typescript
// Logging
import winston from 'winston';
logger.info('User registered', { userId, referredBy });

// Metrics
import prometheus from 'prom-client';
registrationCounter.inc();
creditsAwarded.inc(2);

// Error Tracking
import Sentry from '@sentry/node';
Sentry.captureException(error);
```

## Testing Strategy

### Unit Tests

```typescript
// Test referral code generation
expect(generateReferralCode()).toHaveLength(8);

// Test credit calculation
expect(awardCredits(user, referrer)).toBe(true);
```

### Integration Tests

```typescript
// Test registration with referral
POST /api/auth/register with referrerCode
→ Verify user.referredBy is set

// Test first purchase
POST /api/courses/:id/purchase
→ Verify credits awarded to both users
```

### End-to-End Tests (Playwright/Cypress)

```typescript
test('Referral flow', async () => {
  // Register Lina
  await registerUser('lina@test.com');
  const referralLink = await getReferralLink();
  
  // Register Ryan with referral
  await openPage(referralLink);
  await registerUser('ryan@test.com');
  
  // Ryan purchases
  await purchaseCourse();
  
  // Verify credits
  expect(await getCredits('ryan@test.com')).toBe(2);
  expect(await getCredits('lina@test.com')).toBe(2);
});
```

## Future Enhancements

### 1. Credit Redemption
```typescript
// Allow users to redeem credits for discounts
interface Redemption {
  userId: ObjectId;
  creditsUsed: number;
  courseId: ObjectId;
  discountAmount: number;
}
```

### 2. Referral Leaderboard
```typescript
// Rank users by conversions
GET /api/leaderboard
→ [{username, conversions, creditsEarned}]
```

### 3. Email Notifications
```typescript
// Send emails on:
- User registers with your link
- Referred user makes first purchase
- Credit balance updates
```

### 4. Analytics Dashboard
```typescript
// Track:
- Conversion rate
- Average time to first purchase
- Most popular courses
- Referral chain depth
```

### 5. Advanced Referral Tiers
```typescript
interface ReferralTier {
  name: string;
  minConversions: number;
  creditMultiplier: number; // 2x, 3x, etc.
}
```

## Conclusion

This system design prioritizes:

1. **Simplicity:** Easy to understand and maintain
2. **Reliability:** Atomic transactions prevent data corruption
3. **Security:** Multiple layers of protection
4. **Scalability:** Clear path to horizontal scaling
5. **Developer Experience:** Type safety, clear structure

The `hasConverted` flag is the cornerstone of the referral logic, providing a simple yet robust solution to the credit attribution problem.

---

**Design Philosophy:** "Make it work, make it right, make it fast" - Kent Beck
