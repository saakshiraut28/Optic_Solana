# Optic 

A verification-first platform where every claim earns its place.

> Check out the app at **[optic-solana.vercel.app](optic-solana.vercel.app)**

Optic is an AI-powered content verification platform that filters out noise and keeps only credible, substantive information. Every post is scored before it goes live making Optic a more reliable and accountable source of information.

> **Powered by [Tapestry](https://www.usetapestry.dev)** — Optic's verification and scoring engine is built on top of Tapestry, enabling intelligent, context-aware content evaluation at scale.

---

## 🚀 Features

- **AI-Powered Verification** — Every claim is automatically scored for credibility before it can be published.
- **Smart Content Filtering** — Low-effort, trivial, or casual posts are rejected automatically, keeping the feed clean and meaningful.
- **Agree & Support** — Users can support claims they believe are true, strengthening their credibility score.
- **Disagree & Challenge** — Users can dispute claims they believe are false, as long as they back it up with supporting proof.
- **Score-Based Publishing** — A post only goes live if it meets the required verification threshold, ensuring quality at the source.

---

## How It Works

1. **Submit a Claim** — A user posts something they believe to be true.
2. **AI Verification** — The claim is processed and scored by an AI engine powered by [Tapestry](https://www.usetapestry.dev), which evaluates its credibility and substance.
3. **Score Threshold** — If the claim meets the required score, it gets published. If not (e.g. a trivial "gm" message), it gets rejected.
4. **Community Engagement** — Other users can agree with supporting evidence or disagree with counter-proof, dynamically affecting the claim's standing on the platform.

---

## 📦 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- API access to [Tapestry](https://www.usetapestry.dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/optic.git

# Navigate into the project
cd optic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Tapestry API key and other config to .env

# Start the development server
npm run dev
```

---

## 🌐 Environment Variables

```env
TAPESTRY_API_KEY=your_tapestry_api_key
# Add other required variables here
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request.

---

## 📄 License

MIT © Optic