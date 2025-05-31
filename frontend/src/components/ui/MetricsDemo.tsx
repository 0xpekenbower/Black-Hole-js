'use client';

import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { useMetrics } from '@/hooks/useMetrics';

/**
 * Component that demonstrates metrics tracking
 */
export default function MetricsDemo() {
  const { trackInteraction } = useMetrics();

  const handleButtonClick = () => {
    // Track the interaction
    trackInteraction('click', 'metrics-demo-button');
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Metrics Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          This component demonstrates tracking user interactions.
          Click the button below to see it in action.
        </p>
        <Button 
          onClick={handleButtonClick}
          className="w-full"
        >
          Track Interaction
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          The click event has been tracked for analytics.
        </p>
      </CardContent>
    </Card>
  );
} 