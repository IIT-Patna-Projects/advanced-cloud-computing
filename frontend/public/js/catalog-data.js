/**
 * Shared product catalog dataset for ShopScale e-commerce storefront.
 *
 * Provides realistic cloud infrastructure product records with categories,
 * specifications, stock counts, and pricing in DECIMAL(10, 2) format.
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Unique product identifier.
 * @property {string} title - Product commercial name.
 * @property {string} category - Category slug.
 * @property {string} categoryName - Human-readable category.
 * @property {string} sku - Product stock-keeping unit.
 * @property {number} price - Unit price in USD.
 * @property {number} stock - Available inventory count.
 * @property {string} badge - Marketing or technical tier badge.
 * @property {string} description - Brief summary.
 * @property {string} longDescription - Detailed technical description.
 * @property {Object.<string, string>} specs - Key-value technical specifications.
 * @property {string} sla - Guaranteed Service Level Agreement.
 * @property {number} rating - Average customer satisfaction score (1.0 - 5.0).
 * @property {number} reviewCount - Number of verified reviews.
 */

/** @type {Product[]} */
export const CATALOG_PRODUCTS = [
  {
    id: 1,
    title: "Elastic Cloud Compute Worker v4",
    category: "compute",
    categoryName: "Cloud Compute",
    sku: "SKU-CMP-001",
    price: 49.99,
    stock: 500,
    badge: "Popular",
    description: "High-throughput synthetic compute unit designed for distributed stress benchmarking.",
    longDescription: "Engineered specifically for cloud auto-scaling experiments on AWS. Delivers 8 vCPU synthetic processing capability with predictable I/O cycles, ideal for benchmarking horizontal pod autoscalers (HPA) and ECS target-tracking policies.",
    specs: {
      "vCPU": "8 Dedicated Cores",
      "Memory": "32 GB DDR5 ECC",
      "Network Throughput": "Up to 25 Gbps",
      "Storage": "256 GB NVMe SSD",
      "Architecture": "x86_64 / ARM64"
    },
    sla: "99.99% Availability",
    rating: 4.9,
    reviewCount: 128
  },
  {
    id: 2,
    title: "Managed MySQL Aurora Cluster Node",
    category: "database",
    categoryName: "Databases",
    sku: "SKU-DB-002",
    price: 189.50,
    stock: 120,
    badge: "Enterprise",
    description: "Multi-AZ relational MySQL 8.0 instance with read replica auto-scaling.",
    longDescription: "High-availability MySQL 8.0 database engine pre-configured for ACID compliance and InnoDB row-locking performance under flash-crowd checkout surges. Features automated failover, point-in-time recovery, and aiomysql connection pooling.",
    specs: {
      "Engine": "MySQL 8.0.36 Community",
      "vCPU": "16 vCPUs",
      "RAM": "64 GB Memory-Optimized",
      "IOPS": "10,000 Provisioned IOPS",
      "Replication": "Semi-Synchronous Multi-AZ"
    },
    sla: "99.999% Multi-AZ Uptime",
    rating: 4.8,
    reviewCount: 94
  },
  {
    id: 3,
    title: "Global Edge Content Delivery Accelerator",
    category: "networking",
    categoryName: "Networking",
    sku: "SKU-NET-003",
    price: 39.00,
    stock: 850,
    badge: "Fast Edge",
    description: "Low-latency content distribution edge node with SSL termination.",
    longDescription: "Distributed edge reverse proxy module for offloading static HTML, compiled Tailwind CSS, and client-side JavaScript assets. Integrates seamlessly with Express /api reverse proxy paths and ALB listeners.",
    specs: {
      "Edge Locations": "450+ Points of Presence",
      "SSL / TLS": "TLS 1.3 Strict Termination",
      "Protocols": "HTTP/2, HTTP/3 (QUIC)",
      "DDoS Defense": "Layer 3/4 Shield Protection",
      "Compression": "Brotli & Gzip Auto-Detect"
    },
    sla: "99.99% Edge Delivery",
    rating: 4.7,
    reviewCount: 76
  },
  {
    id: 4,
    title: "Application Load Balancer Ingress Gateway",
    category: "networking",
    categoryName: "Networking",
    sku: "SKU-NET-004",
    price: 24.50,
    stock: 420,
    badge: "Layer 7",
    description: "Layer 7 HTTP/HTTPS traffic router supporting path-based routing and health probes.",
    longDescription: "Advanced Layer 7 load balancer routing traffic across decoupled Express frontend nodes (port 3000) and FastAPI backend pods (port 8000). Features sticky sessions, native TLS termination, and deep health check telemetry.",
    specs: {
      "Routing Tier": "Layer 7 (Application)",
      "Throughput": "100,000 Requests/sec",
      "Health Probes": "Active /health and /healthz",
      "Algorithms": "Round Robin / Least Outstanding Requests",
      "Cross-Zone": "Enabled across 3 Availability Zones"
    },
    sla: "99.99% Routing Guarantee",
    rating: 4.9,
    reviewCount: 110
  },
  {
    id: 5,
    title: "Distributed MemoryStore Cache Instance",
    category: "database",
    categoryName: "Databases",
    sku: "SKU-DB-005",
    price: 65.00,
    stock: 310,
    badge: "Sub-Millisecond",
    description: "In-memory caching engine for session tokens and high-velocity product counts.",
    longDescription: "Fully managed in-memory data store delivering sub-millisecond query latencies. Designed to cache session states, product availability matrices, and user shopping carts during synthetic Locust surge benchmarks.",
    specs: {
      "Engine": "Redis / Valkey Compatible",
      "Latency": "Sub-millisecond (p99 < 1.2ms)",
      "RAM": "16 GB In-Memory",
      "Eviction Policy": "volatile-lru",
      "Persistence": "AOF & RDB Snapshots"
    },
    sla: "99.95% Low-Latency SLA",
    rating: 4.8,
    reviewCount: 62
  },
  {
    id: 6,
    title: "High-Durability Cloud Storage Vault",
    category: "storage",
    categoryName: "Storage",
    sku: "SKU-STR-006",
    price: 15.00,
    stock: 1500,
    badge: "11 9s Durability",
    description: "Scalable object storage vault with client-side encryption and versioning.",
    longDescription: "Object storage bucket engineered for 99.999999999% (11 9s) durability. Used for persisting asset snapshots, container build artifacts, and load test execution logs across benchmark runs.",
    specs: {
      "Durability": "99.999999999%",
      "Capacity": "Unlimited Multi-TB Tier",
      "Encryption": "AES-256 Server-Side / KMS",
      "Versioning": "Enabled with Lifecycle Rules",
      "Replication": "Cross-Region Replicated"
    },
    sla: "99.9% Storage Availability",
    rating: 4.9,
    reviewCount: 204
  },
  {
    id: 7,
    title: "CloudWatch Real-Time Telemetry Suite",
    category: "monitoring",
    categoryName: "Monitoring",
    sku: "SKU-MON-007",
    price: 29.99,
    stock: 680,
    badge: "Observability",
    description: "Full-stack metrics, alarms, and p95/p99 latency dashboard telemetry package.",
    longDescription: "Comprehensive observability suite configured with high-resolution 1-second metric aggregation. Tracks FastAPI request rates, 5xx error spikes, MySQL connection pool saturation, and auto-scaling events.",
    specs: {
      "Resolution": "1-Second Metric Granularity",
      "Alarms": "Dynamic Anomaly Detection",
      "Dashboards": "Custom CloudWatch JSON Models",
      "Log Insights": "Full-text Regex Query Engine",
      "Integration": "Prometheus & OpenTelemetry Ready"
    },
    sla: "99.95% Pipeline Reliability",
    rating: 4.6,
    reviewCount: 45
  },
  {
    id: 8,
    title: "Web Application Firewall & Shield Guard",
    category: "security",
    categoryName: "Security",
    sku: "SKU-SEC-008",
    price: 75.00,
    stock: 210,
    badge: "Protection",
    description: "Layer 7 traffic inspection, SQL injection filtering, and rate limiting rules.",
    longDescription: "Enterprise security shield inspecting incoming traffic before reaching Express or FastAPI. Enforces strict rate limits, blocks known exploit signatures, and inspects request headers against OWASP Top 10 vulnerabilities.",
    specs: {
      "Inspection": "Layer 7 Full Packet Inspection",
      "Rate Limiting": "IP & Token-Based Throttling",
      "Managed Rules": "OWASP Top 10 & Core Rule Set",
      "Latency Impact": "< 1ms added overhead",
      "Bot Control": "Automated Bad Bot Mitigation"
    },
    sla: "99.99% Threat Mitigation",
    rating: 4.8,
    reviewCount: 58
  },
  {
    id: 9,
    title: "Auto-Scaling Container Fleet Worker",
    category: "compute",
    categoryName: "Cloud Compute",
    sku: "SKU-CMP-009",
    price: 35.00,
    stock: 750,
    badge: "Elastic",
    description: "Dynamic Fargate container execution unit with sub-minute scale-out triggers.",
    longDescription: "Serverless container compute task designed to auto-scale dynamically under Locust traffic surges. Scales horizontally between 2 and 50 tasks based on CPU utilization and target tracking metrics.",
    specs: {
      "Orchestrator": "AWS ECS / Fargate",
      "Scale-out Speed": "< 45 seconds cold boot",
      "Isolation": "Dedicated Kernel Hypervisor",
      "Logging": "Direct AWS CloudWatch Driver",
      "Health Integration": "ALB Target Group Probes"
    },
    sla: "99.99% Compute SLA",
    rating: 4.7,
    reviewCount: 89
  },
  {
    id: 10,
    title: "Managed Identity & Secret Vault Key",
    category: "security",
    categoryName: "Security",
    sku: "SKU-SEC-010",
    price: 19.99,
    stock: 900,
    badge: "FIPS 140-2",
    description: "Hardware-backed asymmetric cryptographic key for JWT and database credentials.",
    longDescription: "Centralized secret management service providing automated credential rotation, fine-grained IAM policy access, and envelope encryption for sensitive production secrets without hardcoding in Git.",
    specs: {
      "Compliance": "FIPS 140-2 Level 3 Validated",
      "Rotation": "Automated 30-Day Key Rotation",
      "Access Control": "IAM Role-Based Policies",
      "Algorithms": "RSA 4096 / ECC P-384",
      "Audit Logging": "CloudTrail Immutable Records"
    },
    sla: "99.999% Secret Availability",
    rating: 5.0,
    reviewCount: 142
  },
  {
    id: 11,
    title: "Synthetic Load Simulation Probe Node",
    category: "monitoring",
    categoryName: "Monitoring",
    sku: "SKU-MON-011",
    price: 45.00,
    stock: 380,
    badge: "Load Testing",
    description: "Distributed Locust worker node capable of generating 5,000 virtual users.",
    longDescription: "Synthetic load generation client node calibrated to simulate realistic user browsing, cart additions, and concurrent checkout transactions. Produces high-resolution response time distributions and percentile charts.",
    specs: {
      "Concurreny": "Up to 5,000 Synthetic Swarm Users",
      "Protocols": "HTTP/1.1 & HTTP/2 Async Clients",
      "Execution": "Headless Locust Simulation",
      "Metrics": "p50, p90, p95, p99 Latency Logs",
      "Safety": "Isolated Local/Staging Target Caps"
    },
    sla: "99.9% Simulation Reliability",
    rating: 4.9,
    reviewCount: 77
  },
  {
    id: 12,
    title: "NVMe Ephemeral Storage Accelerator",
    category: "storage",
    categoryName: "Storage",
    sku: "SKU-STR-012",
    price: 55.00,
    stock: 460,
    badge: "Ultra Low Latency",
    description: "High-speed local scratch storage block delivering 500,000 IOPS.",
    longDescription: "Ultra-fast scratch storage volume attached directly to compute workers for temporary file manipulation, intermediate report generation, and high-speed database buffer pool extensions.",
    specs: {
      "Read IOPS": "500,000 IOPS",
      "Write IOPS": "350,000 IOPS",
      "Interface": "PCIe Gen4 NVMe Direct",
      "Encryption": "Hardware Line-Rate Encryption",
      "Format": "Raw Block / Ext4 Ready"
    },
    sla: "99.95% Hardware Uptime",
    rating: 4.7,
    reviewCount: 51
  }
];

/**
 * Retrieve a product by its unique identifier.
 *
 * @param {number|string} id - Product ID.
 * @returns {Product|undefined} Matching product or undefined.
 */
export function getProductById(id) {
  const numericId = Number(id);
  return CATALOG_PRODUCTS.find((p) => p.id === numericId);
}

/**
 * Filter products by category slug and search term.
 *
 * @param {string} [category="all"] - Category slug.
 * @param {string} [searchQuery=""] - Query substring.
 * @param {string} [sortBy="featured"] - Sorting criteria ('featured', 'price-asc', 'price-desc', 'name').
 * @returns {Product[]} Filtered and sorted product array.
 */
export function queryCatalog(category = "all", searchQuery = "", sortBy = "featured") {
  let list = [...CATALOG_PRODUCTS];

  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }

  if (searchQuery && searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  }

  if (sortBy === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return list;
}
