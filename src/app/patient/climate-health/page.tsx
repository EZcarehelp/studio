
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, MapPin, Thermometer, Umbrella, Sun, CloudSun, CloudRain, Zap, ShieldCheck, Info, HelpCircle } from 'lucide-react';
import type { HealthPrediction } from '@/types'; // UserProfile removed as it comes from useAuthState
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { fetchWeatherApi } from 'openmeteo';

// Default location (e.g., Chennai, India - if user profile doesn't have location)
const DEFAULT_LATITUDE = 13.0827;
const DEFAULT_LONGITUDE = 80.2707;
const DEFAULT_LOCATION_NAME = "Chennai, India (Default)";

// Function to predict diseases based on weather data
function predictDiseases(weather: { maxTemp: number | null; uvIndex: number | null; rain: number | null; }): HealthPrediction {
  const diseases: string[] = [];
  const suggestions: string[] = [];

  if (weather.uvIndex !== null && weather.uvIndex > 7) {
    diseases.push("High UV Exposure Risk");
    suggestions.push("Limit sun exposure, especially between 11 AM - 3 PM. Use sunscreen (SPF 30+), wear protective clothing and sunglasses.");
  }
  if (weather.maxTemp !== null && weather.maxTemp > 35) {
    diseases.push("Heatstroke & Dehydration");
    suggestions.push("Drink plenty of water/fluids. Avoid strenuous outdoor activities during peak heat. Wear light, loose-fitting clothes.");
     if (weather.uvIndex === null || weather.uvIndex <= 7) { // Add UV tip if not already covered
        suggestions.push("Even with moderate temperatures, high UV can be harmful. Consider sun protection.");
    }
  } else if (weather.maxTemp !== null && weather.maxTemp > 30) {
     diseases.push("Moderate Heat Discomfort");
     suggestions.push("Stay hydrated. Take breaks in cool areas if outdoors for long periods.");
  }


  if (weather.rain !== null && weather.rain > 5) {
    diseases.push("Increased Risk of Water-borne Diseases & Vector-borne illnesses (e.g., Dengue)");
    suggestions.push("Ensure drinking water is safe. Avoid wading in stagnant water. Use mosquito repellents and keep surroundings clean to prevent mosquito breeding.");
  }
  if (weather.rain !== null && weather.rain > 0.5) {
     diseases.push("Possible Cold/Flu Risk");
     suggestions.push("Stay warm and dry. Maintain good hygiene. Consider indoor activities if rain is heavy.");
  }

  if (weather.maxTemp !== null && weather.maxTemp < 15) {
    diseases.push("Cold Weather Ailments");
    suggestions.push("Dress in layers, protect extremities. Be cautious of flu and respiratory issues. Ensure adequate indoor heating if needed.");
  }
  
  if (weather.uvIndex !== null && weather.uvIndex > 5 && weather.maxTemp !== null && weather.maxTemp < 25 && (weather.rain === null || weather.rain < 1)) {
    diseases.push("Pollen/Allergy Flare-up");
    suggestions.push("Weather might be conducive to high pollen counts. If you have allergies, monitor local pollen levels and take precautions.");
  }


  return diseases.length > 0
    ? { diseases, suggestions }
    : { diseases: [], suggestions: [], message: "No specific climate-related health risks prominently predicted for today. Maintain general wellness practices." };
}

function getWeatherIcon(maxTemp: number | null, rain: number | null, uvIndex: number | null): React.ElementType {
    if (rain !== null && rain > 1) return CloudRain;
    if (maxTemp !== null && maxTemp > 30) return Sun;
    if (uvIndex !== null && uvIndex > 5) return CloudSun; // Or Sun if very high UV
    return CloudSun; // Default
}

interface ProcessedDailyWeather {
  maxTemp: number | null;
  minTemp: number | null;
  precipitation: number | null;
  uvIndex: number | null;
}

export default function ClimateHealthPage() {
  const { userProfile, isLoading: authLoading } = useAuthState();
  const { toast } = useToast();

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [todayWeather, setTodayWeather] = useState<ProcessedDailyWeather | null>(null);
  const [healthPrediction, setHealthPrediction] = useState<HealthPrediction | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (userProfile && userProfile.latitude && userProfile.longitude) {
        setCurrentLocation({ 
          lat: userProfile.latitude, 
          lon: userProfile.longitude,
          name: userProfile.location || `Lat: ${userProfile.latitude.toFixed(2)}, Lon: ${userProfile.longitude.toFixed(2)}`
        });
      } else {
        setCurrentLocation({ lat: DEFAULT_LATITUDE, lon: DEFAULT_LONGITUDE, name: DEFAULT_LOCATION_NAME });
        if(userProfile) { 
            toast({
                title: "Location Not Set",
                description: `Using default location. Please update your profile for personalized weather.`,
                variant: "default",
                duration: 7000
            });
        }
      }
    }
  }, [userProfile, authLoading, toast]);

  useEffect(() => {
    if (currentLocation) {
      const fetchWeatherData = async () => {
        setIsLoadingWeather(true);
        setError(null);
        setHealthPrediction(null);
        setTodayWeather(null);

        const params = {
          latitude: currentLocation.lat,
          longitude: currentLocation.lon,
          daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'uv_index_max'],
          timezone: 'auto',
          forecast_days: 1
        };
        const url = "https://api.open-meteo.com/v1/forecast";

        try {
          const responses = await fetchWeatherApi(url, params);
          const response = responses[0]; // Process first location

          // Attributes for timezone and location (though not strictly needed for this page's display)
          // const utcOffsetSeconds = response.utcOffsetSeconds();
          // const timezone = response.timezone();
          // const timezoneAbbreviation = response.timezoneAbbreviation();
          // const latitude = response.latitude();
          // const longitude = response.longitude();

          const daily = response.daily()!;
          
          // Helper function to get value or null
          const getDailyValue = (variableIndex: number): number | null => {
            const values = daily.variables(variableIndex)?.valuesArray();
            return values && values.length > 0 ? values[0] : null;
          };

          const processedWeather: ProcessedDailyWeather = {
            maxTemp: getDailyValue(0),       // temperature_2m_max
            minTemp: getDailyValue(1),       // temperature_2m_min
            precipitation: getDailyValue(2), // precipitation_sum
            uvIndex: getDailyValue(3),       // uv_index_max
          };
          
          setTodayWeather(processedWeather);
          setHealthPrediction(predictDiseases(processedWeather));

        } catch (err) {
          console.error("Error fetching weather data with openmeteo package:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred while fetching weather.");
        } finally {
          setIsLoadingWeather(false);
        }
      };
      fetchWeatherData();
    }
  }, [currentLocation]);

  if (authLoading || (isLoadingWeather && !todayWeather)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading climate and health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10 rounded-lg" role="alert">
        <CardHeader className="flex flex-row items-center gap-2">
           <AlertTriangle className="h-6 w-6 text-destructive" />
          <CardTitle className="text-destructive">Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <p className="text-sm text-destructive/80 mt-2">
            Could not fetch weather or health prediction data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const WeatherIconDisplay = todayWeather ? getWeatherIcon(todayWeather.maxTemp, todayWeather.precipitation, todayWeather.uvIndex) : HelpCircle;


  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gradient flex items-center">
            <CloudSun className="mr-3 h-7 w-7" />
            Climate & Health Forecast
          </CardTitle>
          <CardDescription>
            Today's weather and potential health considerations based on your location.
          </CardDescription>
        </CardHeader>
      </Card>

      {!currentLocation && !authLoading && (
         <Card className="shadow-md rounded-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary"/>Location Needed</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Please update your profile with your location (latitude and longitude) to get personalized climate and health predictions.</p>
                <Button asChild className="mt-3"><Link href="/patient/settings/profile-info">Update Profile</Link></Button>
            </CardContent>
        </Card>
      )}

      {currentLocation && todayWeather && (
        <Card className="shadow-md rounded-lg card-gradient">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Today's Weather: {currentLocation.name}
              </CardTitle>
              <CardDescription>
                Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
            <WeatherIconDisplay className="h-10 w-10 text-primary" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-md">
              <Thermometer className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-muted-foreground">Max Temp</p>
                <p className="font-semibold">{todayWeather.maxTemp ?? 'N/A'}°C</p>
              </div>
            </div>
             <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-md">
              <Thermometer className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-muted-foreground">Min Temp</p>
                <p className="font-semibold">{todayWeather.minTemp ?? 'N/A'}°C</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-md">
              <Umbrella className="h-5 w-5 text-sky-500" />
              <div>
                <p className="text-muted-foreground">Precipitation</p>
                <p className="font-semibold">{todayWeather.precipitation ?? 'N/A'} mm</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-md">
              <Sun className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-muted-foreground">Max UV Index</p>
                <p className="font-semibold">{todayWeather.uvIndex ?? 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {healthPrediction && (
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-primary">
              <Zap className="mr-2 h-5 w-5" />
              AI Health Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthPrediction.message ? (
              <p className="text-lg text-green-700 dark:text-green-400 flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5" />
                {healthPrediction.message}
              </p>
            ) : (
              <>
                {healthPrediction.diseases.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-destructive mb-1">Potential Health Risks Today:</h3>
                    <ul className="list-disc list-inside pl-4 text-destructive/90 text-sm space-y-0.5">
                      {healthPrediction.diseases.map((disease, index) => (
                        <li key={index}>{disease}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {healthPrediction.suggestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Prevention Tips:</h3>
                    <ul className="list-disc list-inside pl-4 text-muted-foreground text-sm space-y-0.5">
                      {healthPrediction.suggestions.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
        <Card className="mt-6 border-primary/30 bg-primary/5 dark:border-[hsl(var(--accent))]/30 dark:bg-[hsl(var(--accent))]/10 rounded-lg">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Info className="h-5 w-5 text-primary dark:text-[hsl(var(--accent))]" />
                <CardTitle className="text-base text-primary dark:text-[hsl(var(--accent))]">Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-primary/90 dark:text-[hsl(var(--accent))]/90">
                This climate and health forecast is based on general weather patterns and provides informational suggestions only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health. Weather data from Open-Meteo.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
