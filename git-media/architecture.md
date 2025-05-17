## Building a Secure and Scalable Architecture with Raspberry Pi, Cloudflare, and Vercel

### Architecture Overview

```mermaid
graph TD
    A[User] --> B[Vercel Frontend]
    B --> C[api.oocak.com]
    C --> D[Raspberry Pi]
    D --> E[NGINX Reverse Proxy]
    E --> F[Express.js Server]
    F --> G[PostgreSQL Database]

    %% Adding labels to the arrows
    A -->|HTTPS| B
    B -->|API Calls| C
    C -->|Cloudflare Tunnel| D
```

### Cloudflare Tunnel

```mermaid
sequenceDiagram
    participant User
    participant Cloudflare as Cloudflare Edge
    participant Tunnel as cloudflared (RPi)
    User->>Cloudflare: Requests api.oocak.com
    Cloudflare->>Tunnel: Routes via encrypted tunnel
    Tunnel->>NGINX: Proxies to Express.js
```

Why?

No port forwarding → No exposed IPs.

Encrypted outbound connection from RPi to Cloudflare.

### DNS Configuration

```mermaid
pie showData
    title Cloudflare DNS Records (DNS-Only Mode)
    "A: oocak.com → Tunnel IP" : 50
    "CNAME: api.oocak.com → Tunnel Hostname" : 50
```

### Vercel Frontend

```mermaid
flowchart LR
    Vercel -->|Deploys| React/Next.js
    React -->|Calls| api.oocak.com
    style Vercel fill:#000,color:#fff
```
