## Building a Secure and Scalable Architecture with Raspberry Pi, Cloudflare, and Vercel

### Architecture Overview

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffd8d8', 'edgeLabelBackground':'#fff'}}}%%
flowchart
    A[User] -->|HTTPS| B[Vercel Frontend]
    B -->|API Calls| C[api.oocak.com]
    C -->|Cloudflare Tunnel| D[Raspberry Pi]
    D --> E[NGINX Reverse Proxy]
    E --> F[Express.js Server]
    F --> G[PostgreSQL Database]
    style A fill:#f9f,stroke:#333
    style B fill:#bbf,stroke:#333
    style C fill:#8df,stroke:#333
    style D fill:#f96,stroke:#333
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
