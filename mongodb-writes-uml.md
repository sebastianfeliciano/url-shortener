# MongoDB Write Operations UML - URL Shortener

## Sequence Diagram: MongoDB Writes

```mermaid
sequenceDiagram
    participant Client
    participant Express as Express Server
    participant Cache as LRU Cache
    participant MongoDB as MongoDB Atlas
    participant Url as Url Collection
    participant Analytics as Analytics Collection

    Note over Client, Analytics: 1. CREATE SHORT URL (POST /api/create)
    
    Client->>Express: POST /api/create {longUrl}
    Express->>MongoDB: Url.findOne({longUrl})
    MongoDB-->>Express: existingUrl or null
    
    alt URL already exists
        Express-->>Client: Return existing URL (201)
    else URL is new
        Express->>Express: Generate unique shortUrl (nanoid)
        Express->>MongoDB: Url.findOne({shortUrl})
        MongoDB-->>Express: Check uniqueness
        Express->>Express: Generate QR Code
        Express->>MongoDB: new Url({shortUrl, longUrl, qrCode}).save()
        MongoDB-->>Express: Document saved
        Express->>Cache: urlCache.set(shortUrl, data)
        Express-->>Client: Return new URL (201)
    end

    Note over Client, Analytics: 2. URL REDIRECT (GET /:shortUrl)
    
    Client->>Express: GET /:shortUrl
    Express->>Cache: urlCache.get(shortUrl)
    Cache-->>Express: cached data or null
    
    alt Not in cache
        Express->>MongoDB: Url.findOne({shortUrl})
        MongoDB-->>Express: URL document
        Express->>Cache: urlCache.set(shortUrl, data)
    end
    
    Express->>MongoDB: new Analytics({shortUrl, ip, userAgent, redirectTime}).save()
    MongoDB-->>Express: Analytics document saved
    
    Express->>MongoDB: Url.updateOne({shortUrl}, {$inc: {clickCount: 1}, $set: {lastAccessed: now}})
    MongoDB-->>Express: URL updated
    
    Express->>Cache: Update cached clickCount
    Express-->>Client: 301 Redirect to longUrl

    Note over Client, Analytics: 3. READ OPERATIONS (No Writes)
    
    Client->>Express: GET /api/analytics/:shortUrl
    Express->>MongoDB: Url.findOne({shortUrl})
    MongoDB-->>Express: URL document
    Express->>MongoDB: Analytics.find({shortUrl}).sort({timestamp: -1}).limit(100)
    MongoDB-->>Express: Analytics documents
    Express-->>Client: Analytics data

    Client->>Express: GET /api/stats
    Express->>MongoDB: Url.countDocuments()
    MongoDB-->>Express: Total URLs count
    Express->>MongoDB: Analytics.countDocuments()
    MongoDB-->>Express: Total clicks count
    Express-->>Client: Statistics
```

## Database Schema

### Url Collection
```javascript
{
  shortUrl: String (unique, required),
  longUrl: String (required),
  createdAt: Date (default: Date.now),
  clickCount: Number (default: 0),
  lastAccessed: Date,
  qrCode: String (base64 QR code)
}
```

### Analytics Collection
```javascript
{
  shortUrl: String (required),
  timestamp: Date (default: Date.now),
  ip: String,
  userAgent: String,
  redirectTime: Number (milliseconds)
}
```

## Write Operations Summary

### 1. URL Creation (POST /api/create)
- **Write**: `Url.save()` - Creates new URL document
- **Condition**: Only if URL doesn't already exist
- **Data**: shortUrl, longUrl, qrCode, createdAt

### 2. URL Redirect (GET /:shortUrl)
- **Write 1**: `Analytics.save()` - Creates analytics record
- **Write 2**: `Url.updateOne()` - Increments clickCount, updates lastAccessed
- **Condition**: Every time a short URL is accessed
- **Data**: Analytics (shortUrl, ip, userAgent, redirectTime, timestamp)
- **Data**: URL update (clickCount++, lastAccessed)

### 3. Read Operations (No Writes)
- GET /api/analytics/:shortUrl - Reads analytics data
- GET /api/stats - Reads aggregated statistics
- GET /api/urls - Reads URL list

## Performance Optimizations

1. **LRU Cache**: Reduces database reads for frequently accessed URLs
2. **Indexes**: MongoDB automatically indexes unique fields (shortUrl)
3. **Batch Operations**: Analytics writes are individual but fast
4. **Connection Pooling**: Mongoose handles connection management
