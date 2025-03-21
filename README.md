# March Madness Predictor

A modern web application for making March Madness tournament predictions with live updates and advanced analytics.

## Features

- 🏀 Interactive bracket builder with drag-and-drop interface
- 📊 Advanced analytics and prediction tools
- ⚡ Real-time game updates and scores
- 🏆 Social features and competition pools
- 📱 Fully responsive design
- 🔒 Secure user authentication
- 💳 Premium features with subscription options

## Tech Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **State Management**: React Context + SWR
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel
- **Storage**: Vercel KV

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager
- Vercel account (for deployment)
- Stripe account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/march-madness-predictor.git
   cd march-madness-predictor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   VERCEL_KV_URL=your_vercel_kv_url
   VERCEL_KV_REST_API_TOKEN=your_vercel_kv_token
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── lib/             # Utility functions and API clients
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
└── styles/          # Global styles and Tailwind config
```

### Key Components

- `BracketBuilder`: Interactive tournament bracket interface
- `LiveScores`: Real-time game updates component
- `PredictionEngine`: Analytics and prediction tools
- `UserDashboard`: User profile and bracket management
- `SubscriptionPlans`: Premium features and payment handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@marchmadnesspredictor.com or join our Discord community. 