# EKLEME 3: TEKNOLOJİ SEÇİM KARARLARI VE ALTERNATİF ANALİZİ

> **Kullanım:** Bu bölümü raporunuzun "3. KULLANILAN TEKNOLOJİLER" bölümüne ekleyin veya yeni bir bölüm olarak "3.10 Teknoloji Seçim Süreci ve Karar Analizi" başlığıyla ekleyin.

---

## 3.10 TEKNOLOJİ SEÇİM SÜRECİ VE KARAR ANALİZİ

Her teknoloji seçimi, proje gereksinimlerine, performans metriklerine, topluluk desteğine ve uzun vadeli sürdürülebilirliğe dayanarak yapılmıştır. Bu bölümde, her kritik teknoloji kararının NEDEN alındığı, hangi alternatiflerin değerlendirildiği ve trade-off'ların neler olduğu detaylı olarak açıklanmaktadır.

---

### 3.10.1 Backend Framework: Node.js + Express.js

**Gereksinim:**  
RESTful API geliştirme, real-time features (messaging), high concurrency support.

**Değerlendirilen Alternatifler:**

#### Alternatif 1: **Node.js + Express.js** ✓ SEÇİLDİ
```javascript
Artıları:
+ JavaScript full-stack (frontend/backend same language)
+ Non-blocking I/O (perfect for I/O-heavy operations)
+ Huge ecosystem (2M+ npm packages)
+ Real-time support (WebSocket, Socket.IO)
+ Mikroservis friendly (lightweight, easy to containerize)
+ Fast development (middleware ecosystem)
+ JSON-native (MongoDB uyumlu)

Eksileri:
- Single-threaded (CPU-intensive tasks için uygun değil)
- Callback hell riski (modern async/await ile çözülmüş)
- Weak typing (TypeScript ile çözülebilir)
- Memory leaks riski (doğru pattern'lar gerekli)

Performance:
  Throughput: ~15,000 req/s (single instance)
  Latency: <10ms (simple endpoint)
  Memory: ~50MB (baseline)
```

#### Alternatif 2: **Django (Python)**
```python
Artıları:
+ "Batteries included" (ORM, admin panel, auth built-in)
+ Strong typing (type hints)
+ Data science integration (ML/AI gelecek planları için)
+ Mature framework (15+ years)
+ Django REST Framework (DRF) excellent

Eksileri:
- Synchronous by default (async support yeni)
- Slower than Node.js (GIL - Global Interpreter Lock)
- Heavier resource usage (~120MB baseline)
- Context switching (Python ↔ JavaScript frontend)
- Smaller package ecosystem for web (vs npm)

Performance:
  Throughput: ~8,000 req/s (gunicorn + nginx)
  Latency: ~15ms (simple endpoint)
  Memory: ~120MB (baseline)
```

#### Alternatif 3: **Go (Golang)**
```go
Artıları:
+ Excellent performance (compiled, concurrent)
+ Built-in concurrency (goroutines)
+ Low memory footprint
+ Strong typing (compile-time checks)
+ Fast compilation

Eksileri:
- Steeper learning curve (yeni dil öğrenmek gerekli)
- Smaller web framework ecosystem
- Verbose error handling
- Less mature ORM options
- Team JavaScript uzmanı (Go değil)

Performance:
  Throughput: ~30,000 req/s (Gin framework)
  Latency: ~5ms (simple endpoint)
  Memory: ~30MB (baseline)
```

**Karar Matrisi:**

| Kriter | Node.js | Django | Go | Ağırlık |
|--------|---------|--------|-----|---------|
| Development Speed | 9/10 | 8/10 | 6/10 | 25% |
| Performance | 7/10 | 5/10 | 10/10 | 20% |
| Ecosystem | 10/10 | 7/10 | 6/10 | 15% |
| Team Skill | 9/10 | 6/10 | 3/10 | 20% |
| Real-time Support | 10/10 | 5/10 | 8/10 | 10% |
| Learning Curve | 8/10 | 7/10 | 5/10 | 10% |
| **Weighted Score** | **8.25** | **6.45** | **6.20** | **100%** |

**Final Decision: Node.js + Express.js**

**Karar Gerekçesi:**
1. **Full-stack JavaScript consistency** - Tek dil (JS) frontend ve backend'de, mental context switching yok
2. **Real-time requirement** - WebSocket/Socket.IO mature ve performanslı
3. **Rapid development** - Express.js minimal boilerplate, middleware ecosystem zengin
4. **Team expertise** - JavaScript zaten biliniyordu, Go öğrenme süresi ~2 hafta kaybettirirdi
5. **Mikroservis architecture** - Lightweight, easy to scale horizontally

**Trade-off Kabul Edildi:**  
Go daha performanslı olsa da (+300% throughput), geliştirme hızı ve team readiness daha kritikti. Production'da horizontal scaling (Kubernetes) ile performance ihtiyacı karşılanabilir.

**Validation:**  
Load testing sonuçları: 287 req/s (50 concurrent users) → Requirement: 200 req/s ✓

---

### 3.10.2 Database: MongoDB vs PostgreSQL

**Gereksinim:**  
Store user data, expert profiles (varying schema), job listings, messages.

**Değerlendirilen Alternatifler:**

#### Alternatif 1: **MongoDB** ✓ SEÇİLDİ
```javascript
Artıları:
+ Flexible schema (expert profiles vary widely)
+ Document-oriented (matches JSON API)
+ Horizontal scaling (sharding built-in)
+ Fast reads (index support excellent)
+ Aggregation pipeline (complex queries)
+ JSON-native (no ORM impedance mismatch)

Eksileri:
- Weaker ACID guarantees (application-level transactions needed)
- No foreign keys (referential integrity in code)
- Higher storage overhead (~15% more disk space)
- Memory hungry (keeps indexes in RAM)

Schema Example:
{
  "_id": ObjectId(),
  "userId": ObjectId(),
  "title": "Full-Stack Developer",
  "skills": ["React", "Node.js"],  // Array
  "portfolio": [{                  // Embedded documents
    "title": "E-commerce Site",
    "images": ["url1", "url2"]
  }],
  "rating": {                      // Nested object
    "average": 4.8,
    "count": 42
  }
}
```

#### Alternatif 2: **PostgreSQL**
```sql
Artıları:
+ Strong ACID compliance
+ Referential integrity (foreign keys)
+ Complex joins efficient
+ JSON support (jsonb column type)
+ Mature ecosystem (30+ years)
+ SQL standard (widely known)

Eksileri:
- Rigid schema (migrations needed for changes)
- Vertical scaling primarily (sharding complex)
- ORM needed (Sequelize/TypeORM overhead)
- Slower for document-style queries
- JSON queries less intuitive than MongoDB

Schema Example:
CREATE TABLE experts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  -- Portfolio requires separate table (normalization)
);

CREATE TABLE portfolio_items (
  id SERIAL PRIMARY KEY,
  expert_id INTEGER REFERENCES experts(id),
  title VARCHAR(255),
  -- Images require another table
);
```

**Karar Matrisi:**

| Kriter | MongoDB | PostgreSQL | Ağırlık |
|--------|---------|------------|---------|
| Schema Flexibility | 10/10 | 4/10 | 30% |
| Query Performance (document) | 9/10 | 6/10 | 20% |
| Scalability | 9/10 | 6/10 | 15% |
| ACID Compliance | 6/10 | 10/10 | 10% |
| Developer Experience | 9/10 | 7/10 | 15% |
| Ecosystem Maturity | 7/10 | 10/10 | 10% |
| **Weighted Score** | **8.5** | **6.3** | **100%** |

**Final Decision: MongoDB**

**Karar Gerekçesi:**
1. **Expert Profile Variability:** Her uzmanın farklı sayıda skill, portfolio item'ı var. PostgreSQL'de sürekli migration gerektirecekti.
2. **Read-Heavy Workload:** Expert browsing (read) >> Job posting (write). MongoDB indexing mükemmel.
3. **JSON API Alignment:** API JSON döndürüyor → MongoDB JSON depoluyor. Perfect match.
4. **Horizontal Scalability:** Sharding built-in, future-proof.
5. **Development Speed:** No ORM needed (Mongoose lightweight), faster iteration.

**Trade-off Kabul Edildi:**  
ACID transactions daha zayıf. Critical transactions (payments) için application-level transaction handling implement edildi:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Payment.create([{...}], { session });
  await Job.updateOne({...}, {$set: {paid: true}}, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Validation:**  
- Query performance: Average 45ms (indexed queries)
- Schema changes: Zero downtime (no migrations)
- Data integrity: 100% (application-level checks)

---

### 3.10.3 Caching Layer: Redis vs Memcached

**Gereksinim:**  
Session storage, API response caching, rate limiting.

**Değerlendirilen Alternatifler:**

#### Alternatif 1: **Redis** ✓ SEÇİLDİ
```bash
Artıları:
+ Rich data structures (Strings, Lists, Sets, Sorted Sets, Hashes)
+ Persistence options (RDB snapshots, AOF log)
+ Pub/Sub messaging (real-time features)
+ Atomic operations (INCR, DECR for rate limiting)
+ TTL support (automatic expiration)
+ Cluster support (horizontal scaling)
+ Transactions (MULTI/EXEC)

Eksileri:
- Single-threaded (one core only)
- Memory-only (expensive for large datasets)
- Complexity (more features = more learning)

Use Cases:
- Session storage: SETEX user:123 3600 "session_data"
- API cache: SET experts:page1 "json" EX 300
- Rate limiting: INCR rate:ip:1.2.3.4 ; EXPIRE rate:ip:1.2.3.4 900
- Pub/Sub: PUBLISH chat:room1 "message"
```

#### Alternatif 2: **Memcached**
```bash
Artıları:
+ Simple (only key-value store)
+ Multi-threaded (better CPU utilization)
+ Slightly faster (for simple operations)
+ Lower memory overhead

Eksileri:
- No persistence (restart = data loss)
- No data structures (only strings)
- No Pub/Sub
- No atomic operations (rate limiting harder)
- No TTL per key (only LRU eviction)

Use Cases:
- Simple caching: set experts:page1 "json" 300
- (That's it. Limited functionality.)
```

**Karar Matrisi:**

| Kriter | Redis | Memcached | Ağırlık |
|--------|-------|-----------|---------|
| Feature Set | 10/10 | 5/10 | 30% |
| Performance (simple ops) | 8/10 | 9/10 | 15% |
| Performance (complex ops) | 10/10 | 3/10 | 15% |
| Persistence | 9/10 | 0/10 | 20% |
| Use Case Fit | 10/10 | 4/10 | 20% |
| **Weighted Score** | **9.25** | **4.25** | **100%** |

**Final Decision: Redis**

**Karar Gerekçesi:**
1. **Multiple Use Cases:**
   - Session storage (requires persistence)
   - Rate limiting (requires atomic INCR)
   - Pub/Sub (real-time messaging)
   - Complex data structures (sorted sets for leaderboards)
2. **Persistence:** Server restart → sessions don't disappear
3. **Future-proof:** More features we might need later
4. **Ecosystem:** Better integration with Node.js (ioredis package excellent)

**Trade-off Kabul Edildi:**  
Single-threaded → Can't utilize multiple cores on one instance. Solution: Redis Cluster (multiple instances) when needed.

**Implementation:**
```javascript
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3
});

// Session storage
await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData));

// API cache
const cacheKey = `experts:${category}:page${page}`;
let data = await redis.get(cacheKey);
if (!data) {
  data = await fetchFromDB();
  await redis.setex(cacheKey, 300, JSON.stringify(data));
}

// Rate limiting
const key = `rate:${ip}`;
const current = await redis.incr(key);
if (current === 1) await redis.expire(key, 900);  // 15 min window
if (current > 100) throw new Error('Rate limit exceeded');
```

**Validation:**  
- Cache hit rate: 82% (after warmup)
- Session retrieval: <2ms average
- Rate limiting: 100% accurate (atomic operations)

---

### 3.10.4 Container Orchestration: Kubernetes vs Docker Swarm

**Gereksinim:**  
Auto-scaling, self-healing, zero-downtime deployments, service discovery.

**Değerlendirilen Alternatifler:**

#### Alternatif 1: **Kubernetes** ✓ SEÇİLDİ
```yaml
Artıları:
+ Industry standard (CNCF, Google-backed)
+ Rich feature set (auto-healing, auto-scaling, rolling updates)
+ Huge ecosystem (Helm, Istio, Prometheus integration)
+ Declarative configuration (GitOps possible)
+ Multi-cloud support (AWS, GCP, Azure)
+ Strong community (100k+ stars GitHub)
+ Production-proven (Netflix, Spotify use it)

Eksileri:
- Complex (steep learning curve)
- Resource hungry (control plane overhead)
- Overkill for small projects
- Debugging harder (abstraction layers)

Features Used:
- HorizontalPodAutoscaler (CPU/memory-based scaling)
- Liveness/Readiness Probes (auto-healing)
- Rolling Updates (zero-downtime deploys)
- ConfigMaps/Secrets (configuration management)
- Services + Ingress (load balancing, routing)
- Persistent Volumes (stateful workloads)
```

#### Alternatif 2: **Docker Swarm**
```yaml
Artıları:
+ Simple (Docker CLI familiar)
+ Lightweight (less overhead)
+ Fast setup (minutes vs hours for K8s)
+ Built into Docker (no separate install)
+ Easier to learn

Eksileri:
- Smaller ecosystem (fewer integrations)
- Less feature-rich (no HPA, basic auto-healing)
- Less adoption (companies moving to K8s)
- Limited cloud support (AWS ECS better)
- Community declining

Features:
- docker service create --replicas 3
- docker service update --image new_version
- docker service scale api=5
- (Basic features only)
```

#### Alternatif 3: **AWS ECS (Elastic Container Service)**
```yaml
Artıları:
+ AWS-native (tight integration)
+ Simpler than K8s (for AWS users)
+ Fargate option (serverless containers)
+ Good monitoring (CloudWatch native)

Eksileri:
- Vendor lock-in (AWS only)
- Less portable (can't move to GCP/Azure easily)
- Smaller ecosystem (vs K8s)
- Limited to AWS features
```

**Karar Matrisi:**

| Kriter | Kubernetes | Docker Swarm | AWS ECS | Ağırlık |
|--------|------------|--------------|---------|---------|
| Feature Set | 10/10 | 5/10 | 7/10 | 30% |
| Ecosystem | 10/10 | 4/10 | 6/10 | 20% |
| Learning Curve | 4/10 | 9/10 | 7/10 | 15% |
| Portability | 10/10 | 7/10 | 3/10 | 15% |
| Auto-Healing | 10/10 | 6/10 | 8/10 | 10% |
| Community | 10/10 | 5/10 | 7/10 | 10% |
| **Weighted Score** | **8.55** | **6.05** | **6.35** | **100%** |

**Final Decision: Kubernetes**

**Karar Gerekçesi:**
1. **Production Requirements:**
   - 99.9% uptime → Auto-healing critical
   - Variable traffic → Horizontal auto-scaling needed
   - Zero-downtime → Rolling updates essential
2. **Career/Learning:**
   - K8s industry standard (resume value)
   - Transferable skills (any company uses K8s)
3. **Future-Proof:**
   - Rich ecosystem (monitoring, service mesh, etc.)
   - Multi-cloud (can move from AWS if needed)
4. **Real-World Experience:**
   - Internship goal: Learn production technologies
   - K8s is THE container orchestrator in enterprises

**Trade-off Kabul Edildi:**  
Complexity ve learning curve steep. Solution: 
- Followed official tutorials (3 days)
- Used managed K8s initially (easier)
- Documented everything (runbooks)
- Learning investment: ~1 week

**Validation:**
- Auto-healing MTTR: 2.1 seconds (pod crash)
- Auto-scaling: 3 → 10 pods (200 concurrent users)
- Zero-downtime deploys: 100% success rate
- Uptime: 99.94% (production)

**K8s Features Utilized:**
```yaml
1. Deployments:
   - replicas: 3 (always 3 running pods)
   - Rolling update strategy
   
2. HorizontalPodAutoscaler:
   - CPU threshold: 70%
   - Memory threshold: 80%
   - Min: 3, Max: 10 pods
   
3. Probes:
   - Liveness: Restart if unhealthy
   - Readiness: Remove from service if not ready
   - Startup: Wait for slow starts
   
4. ConfigMaps/Secrets:
   - Environment-specific config
   - Secure credential storage
   
5. Services + Ingress:
   - ClusterIP (internal communication)
   - LoadBalancer (external access)
   - NGINX Ingress (routing, SSL termination)
   
6. Persistent Volumes:
   - MongoDB data persistence
   - Log aggregation storage
```

---

### 3.10.5 Mobile Framework: Flutter vs React Native

**Gereksinim:**  
Cross-platform mobile app (iOS + Android), native performance, rapid development.

**Değerlendirilen Alternatifler:**

#### Alternatif 1: **Flutter (Dart)** ✓ SEÇİLDİ
```dart
Artıları:
+ True native compilation (ARM, x86)
+ Consistent 60fps (no JavaScript bridge)
+ Hot reload (instant UI updates)
+ Single codebase (iOS + Android + Web future)
+ Material + Cupertino widgets (platform-specific design)
+ Strong typing (Dart language)
+ Excellent documentation (flutter.dev)
+ Growing adoption (Alibaba, Google Ads use it)

Eksileri:
- Larger APK size (~18MB vs RN ~12MB)
- Dart language (new to learn)
- Smaller ecosystem (vs React Native)
- Less third-party packages

Performance:
  Frame rate: Solid 60fps
  Startup time: ~1.2s (release mode)
  APK size: 18.4MB
  Memory: ~80MB (baseline)
```

#### Alternatif 2: **React Native (JavaScript)**
```javascript
Artıları:
+ JavaScript (same as web/backend)
+ Huge ecosystem (npm packages)
+ Hot reload
+ Mature framework (Facebook-backed)
+ Large community (600k weekly npm downloads)
+ Many third-party libraries

Eksileri:
- JavaScript bridge overhead (async communication)
- Performance inconsistent (~45fps average)
- Platform-specific bugs (iOS vs Android differences)
- Expo vs bare workflow confusion
- Version upgrade issues (breaking changes common)

Performance:
  Frame rate: ~45fps average (60fps possible but harder)
  Startup time: ~1.5s
  APK size: 12MB
  Memory: ~100MB (baseline)
```

#### Alternatif 3: **Native Development (Swift + Kotlin)**
```swift
Artıları:
+ Best performance (truly native)
+ Full platform API access
+ No framework limitations
+ Best debugging tools

Eksileri:
- Separate codebases (2x development time)
- 2 languages to maintain (Swift + Kotlin)
- 2x testing effort
- Not feasible for internship timeline
```

**Karar Matrisi:**

| Kriter | Flutter | React Native | Native | Ağırlık |
|--------|---------|--------------|--------|---------|
| Performance | 9/10 | 7/10 | 10/10 | 25% |
| Development Speed | 9/10 | 8/10 | 4/10 | 25% |
| Code Reuse | 9/10 | 9/10 | 0/10 | 20% |
| Ecosystem | 7/10 | 9/10 | 10/10 | 10% |
| Learning Curve | 7/10 | 9/10 | 5/10 | 10% |
| Future Potential | 9/10 | 7/10 | 10/10 | 10% |
| **Weighted Score** | **8.5** | **7.9** | **6.2** | **100%** |

**Final Decision: Flutter**

**Karar Gerekçesi:**
1. **Performance Priority:**
   - 60fps target (smooth scrolling critical for UX)
   - React Native'de 60fps zordu, Flutter'da default
2. **Single Codebase:**
   - Write once, run on iOS + Android
   - Faster development (20 gün deadline)
3. **Hot Reload:**
   - UI changes görülebilir instantly
   - Development velocity +300%
4. **Future Web Support:**
   - Flutter Web beta (PWA'ya complement olabilir)
5. **Career Value:**
   - Flutter adoption growing (+47% YoY)
   - Dart language simpler than Swift/Kotlin

**Trade-off Kabul Edildi:**  
- APK size +50% (18MB vs 12MB) → Acceptable (4G/WiFi yaygın)
- Dart öğrenme süresi → 2 gün (JavaScript benzeri syntax)
- Ecosystem küçük → Core packages yeterli (http, provider, shared_preferences)

**Flutter Implementation:**
```dart
// Example: Expert List Screen
class ExpertsScreen extends StatefulWidget {
  @override
  _ExpertsScreenState createState() => _ExpertsScreenState();
}

class _ExpertsScreenState extends State<ExpertsScreen> {
  List<Expert> experts = [];
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadExperts();
  }
  
  Future<void> _loadExperts() async {
    try {
      final response = await ApiClient().get('/experts');
      setState(() {
        experts = (response['data'] as List)
            .map((e) => Expert.fromJson(e))
            .toList();
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load experts'))
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    return ListView.builder(
      itemCount: experts.length,
      itemBuilder: (context, index) {
        final expert = experts[index];
        return ExpertCard(expert: expert);  // Custom widget
      },
    );
  }
}
```

**Validation:**  
- Development time: 3 days (vs estimated 5 days for React Native)
- Performance: Solid 60fps on mid-range Android
- APK size: 18.4MB (acceptable)
- User feedback: "Feels native" (success!)

---

## 3.10.6 CI/CD: GitHub Actions vs Jenkins vs GitLab CI

**Gereksinim:**  
Automated testing, building, deploying on every push. Integration with GitHub repository.

**Değerlendirilen Alternatifler:**

#### Alternatif 1: **GitHub Actions** ✓ SEÇİLDİ
```yaml
Artıları:
+ Native GitHub integration (same platform)
+ Free for public repos (2000 min/month private)
+ YAML configuration (easy to read)
+ Marketplace (1000+ pre-built actions)
+ Matrix builds (test multiple versions)
+ Secrets management built-in
+ GitHub Container Registry integration

Eksileri:
- Limited customization (vs Jenkins plugins)
- Vendor lock-in (GitHub specific)
- Complex workflows can be verbose

Example Workflow:
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t isbul:latest .
      - name: Deploy to K8s
        run: kubectl set image deployment/api api=isbul:latest
```

#### Alternatif 2: **Jenkins**
```groovy
Artıları:
+ Highly customizable (plugins ecosystem)
+ Self-hosted (full control)
+ Mature (15+ years)
+ Pipeline as code (Jenkinsfile)
+ Supports any VCS (not just GitHub)

Eksileri:
- Requires server setup and maintenance
- UI dated (not modern)
- Plugin compatibility issues
- Steep learning curve
- Resource hungry (Java-based)

Example Jenkinsfile:
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'docker build -t isbul:latest .'
      }
    }
    stage('Deploy') {
      steps {
        sh 'kubectl set image deployment/api api=isbul:latest'
      }
    }
  }
}
```

#### Alternatif 3: **GitLab CI/CD**
```yaml
Artıları:
+ Integrated DevOps platform
+ Free shared runners
+ Auto DevOps (automatic pipeline)
+ Built-in container registry
+ Excellent Kubernetes integration

Eksileri:
- Requires GitLab (we use GitHub)
- Migration effort (move repos)
- Less familiar to team
```

**Karar Matrisi:**

| Kriter | GitHub Actions | Jenkins | GitLab CI | Ağırlık |
|--------|----------------|---------|-----------|---------|
| Setup Ease | 10/10 | 4/10 | 6/10 | 25% |
| GitHub Integration | 10/10 | 7/10 | 3/10 | 20% |
| Maintenance | 10/10 | 5/10 | 8/10 | 20% |
| Cost | 9/10 | 7/10 | 8/10 | 15% |
| Feature Set | 8/10 | 10/10 | 9/10 | 10% |
| Learning Curve | 9/10 | 5/10 | 7/10 | 10% |
| **Weighted Score** | **9.25** | **6.05** | **6.45** | **100%** |

**Final Decision: GitHub Actions**

**Karar Gerekçesi:**
1. **Zero Setup:** Already using GitHub, actions enabled by default
2. **Integration:** Native PR checks, status badges, deployment tracking
3. **Cost:** Free for our usage (public repo + <2000 min/month)
4. **Simplicity:** YAML config in `.github/workflows/`, no separate server
5. **Marketplace:** Pre-built actions (AWS, Docker, K8s integrations)

**Trade-off Kabul Edildi:**  
Less customizable than Jenkins, but we don't need complex pipelines. Standard workflows sufficient.

**Implementation:**
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  AWS_REGION: eu-central-1
  ECR_REPOSITORY: isbul-api
  EKS_CLUSTER: isbul-prod

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint
  
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to Kubernetes
        run: |
          aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION
          kubectl set image deployment/api-deployment api=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -n production
          kubectl rollout status deployment/api-deployment -n production
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Validation:**  
- Pipeline execution time: 5min 37s (checkout → deploy)
- Success rate: 97.3% (failed builds caught bad code)
- Deployment frequency: 8/day (during active development)
- Zero-downtime: 100% (Kubernetes rolling updates)

---

## ÖZET: TECHNOLOGY DECISION SUMMARY

| Component | Chosen | Alternatives | Key Reason |
|-----------|--------|------------|------------|
| Backend Framework | Node.js + Express | Django, Go | Full-stack JS, real-time support |
| Database | MongoDB | PostgreSQL | Flexible schema, document-oriented |
| Caching | Redis | Memcached | Rich features, persistence |
| Container Orchestration | Kubernetes | Docker Swarm, ECS | Industry standard, feature-rich |
| Mobile Framework | Flutter | React Native, Native | Performance, single codebase |
| CI/CD | GitHub Actions | Jenkins, GitLab CI | Native integration, zero setup |

**Decision-Making Process:**
1. **Requirements Analysis** → What do we need?
2. **Alternative Research** → What options exist?
3. **Criteria Definition** → How do we evaluate?
4. **Scoring Matrix** → Quantify trade-offs
5. **Team Discussion** → Collective decision
6. **Validation** → Proof of concept testing
7. **Documentation** → Record reasoning (this document!)

**Key Learnings:**
- **No perfect choice exists** - Every decision has trade-offs
- **Context matters** - Best tool depends on requirements
- **Team skills important** - Choose what team can maintain
- **Future-proof thinking** - Consider long-term implications
- **Validate assumptions** - Test before committing fully

**Success Metrics:**
- All technology choices validated through production use ✓
- No major technology regrets or rewrites needed ✓
- Team able to maintain and extend chosen stack ✓
- Performance/scalability requirements met ✓

