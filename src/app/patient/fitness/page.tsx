import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const FitnessTrackerPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Fitness Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Steps Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-muted-foreground">Steps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calories Burned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0</p>
            <p className="text-muted-foreground">Calories</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Meal Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Meal logging functionality will be added here, including image uploads for calorie tracking.</p>
          {/* Placeholder for meal logging form and image upload */}
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessTrackerPage;
