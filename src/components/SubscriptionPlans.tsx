import { useSubscription } from '@/hooks/useAuth';
import { getSubscriptionColors } from '@/lib/utils';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Basic bracket creation and live updates',
    features: [
      'Create one bracket',
      'Basic live scores',
      'Public leaderboards',
      'Ad-supported experience',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    description: 'Enhanced features for serious fans',
    features: [
      'Create multiple brackets',
      'Advanced stats and insights',
      'Real-time notifications',
      'Ad-free experience',
      'Private leagues',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    description: 'Ultimate tournament experience',
    features: [
      'All Premium features',
      'AI-powered predictions',
      'Historical analysis',
      'Priority support',
      'Expert strategy guides',
      'Bracket insurance',
    ],
  },
];

interface SubscriptionPlansProps {
  onSubscribe?: (tier: string) => void;
}

export default function SubscriptionPlans({ onSubscribe }: SubscriptionPlansProps) {
  const { tier: currentTier, isLoading, subscribe } = useSubscription();
  
  const handleSubscribe = async (planId: string) => {
    try {
      await subscribe(planId);
      onSubscribe?.(planId);
    } catch (error) {
      console.error('Subscription error:', error);
      // Show error toast
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Select the perfect plan for your March Madness experience
          </p>
        </div>
        
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentTier.toLowerCase() === plan.id;
            const { text: tierText, bg: tierBg } = getSubscriptionColors(plan.id);
            
            return (
              <div
                key={plan.id}
                className={`rounded-lg shadow-lg bg-white p-8 ${
                  isCurrentPlan ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Plan Header */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className={`inline-block px-4 py-1 rounded-full ${tierText} ${tierBg} text-sm font-semibold mt-2`}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}/month`}
                  </div>
                  <p className="mt-4 text-gray-600">{plan.description}</p>
                </div>
                
                {/* Features List */}
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-accent flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Action Button */}
                <div className="mt-8">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-lg font-semibold"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full ${
                        plan.id === 'free'
                          ? 'bg-secondary hover:bg-secondary/90'
                          : 'bg-primary hover:bg-primary/90'
                      } text-white py-3 px-6 rounded-lg font-semibold transition`}
                    >
                      {plan.id === 'free' ? 'Get Started' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Guarantee Notice */}
        <div className="mt-12 text-center text-gray-600">
          <p>30-day money-back guarantee • Cancel anytime • Secure payment</p>
        </div>
      </div>
    </div>
  );
} 