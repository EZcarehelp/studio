
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardDescription as it's not used directly in the new design
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, MapPin, Sun, CloudSun, CloudRain, Zap, ShieldCheck, Info, HelpCircle, Droplet, Wind, ThermometerIcon } from 'lucide-react';
import type { HealthPrediction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { fetchWeatherApi } from 'openmeteo';
import { cn } from '@/lib/utils';

const DEFAULT_LATITUDE = 13.0827; // Chennai
const DEFAULT_LONGITUDE = 80.2707;
const DEFAULT_LOCATION_NAME = "Chennai, India (Default)";

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
  } else if (weather.maxTemp !== null && weather.maxTemp > 30 && weather.maxTemp <= 35) {
     diseases.push("Moderate Heat Discomfort Risk");
     suggestions.push("Stay hydrated. Take breaks in cool areas if outdoors for long periods.");
  }

  if (weather.rain !== null && weather.rain > 5) {
    diseases.push("Increased Risk of Water-borne Diseases & Vector-borne illnesses (e.g., Dengue)");
    suggestions.push("Ensure drinking water is safe. Avoid wading in stagnant water. Use mosquito repellents and keep surroundings clean to prevent mosquito breeding.");
  }
  if (weather.rain !== null && weather.rain > 0.5 && weather.rain <=5) {
     diseases.push("Possible Cold/Flu Risk due to Rain");
     suggestions.push("Stay warm and dry. Maintain good hygiene. Consider indoor activities if rain is heavy.");
  }

  if (weather.maxTemp !== null && weather.maxTemp < 15) {
    diseases.push("Cold Weather Ailments (Flu, Sore Throat)");
    suggestions.push("Dress in layers, protect extremities. Be cautious of flu and respiratory issues. Ensure adequate indoor heating if needed.");
  }
  
  if (weather.uvIndex !== null && weather.uvIndex > 5 && weather.maxTemp !== null && weather.maxTemp < 25 && (weather.rain === null || weather.rain < 1)) {
    diseases.push("Potential for Pollen/Allergy Flare-up");
    suggestions.push("Weather might be conducive to high pollen counts. If you have allergies, monitor local pollen levels and take precautions.");
  }

  return diseases.length > 0
    ? { diseases, suggestions }
    : { diseases: [], suggestions: [], message: "No specific climate-related health risks prominently predicted for today based on available weather data. Maintain general wellness practices." };
}

interface ProcessedDailyWeather {
  maxTemp: number | null;
  minTemp: number | null;
  precipitation: number | null;
  uvIndex: number | null;
}

function getWeatherIcon(maxTemp: number | null, rain: number | null, uvIndex: number | null): { Icon: React.ElementType, description: string } {
    if (rain !== null && rain > 1) return { Icon: CloudRain, description: "Rainy" };
    if (maxTemp !== null && maxTemp > 30 && (uvIndex === null || uvIndex > 5)) return { Icon: Sun, description: "Sunny & Hot" };
    if (maxTemp !== null && maxTemp > 30) return { Icon: CloudSun, description: "Partly Cloudy & Hot"};
    if (uvIndex !== null && uvIndex > 5 && (rain === null || rain < 0.5)) return { Icon: Sun, description: "Sunny" };
    return { Icon: CloudSun, description: "Partly Cloudy" };
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
                title: "Using Default Location",
                description: `Your profile location isn't set. Update it for personalized weather.`,
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
          const response = responses[0];
          const daily = response.daily()!;
          
          const getDailyValue = (variableIndex: number): number | null => {
            const values = daily.variables(variableIndex)?.valuesArray();
            return values && values.length > 0 ? Number(parseFloat(values[0].toFixed(1))) : null;
          };

          const processedWeather: ProcessedDailyWeather = {
            maxTemp: getDailyValue(0), 
            minTemp: getDailyValue(1), 
            precipitation: getDailyValue(2), 
            uvIndex: getDailyValue(3), 
          };
          
          setTodayWeather(processedWeather);
          setHealthPrediction(predictDiseases(processedWeather));

        } catch (err) {
          console.error("Error fetching weather data:", err);
          setError(err instanceof Error ? err.message : "Could not fetch weather data.");
        } finally {
          setIsLoadingWeather(false);
        }
      };
      fetchWeatherData();
    }
  }, [currentLocation]);
  
  const { Icon: CurrentWeatherIcon, description: weatherDescription } = todayWeather ? getWeatherIcon(todayWeather.maxTemp, todayWeather.precipitation, todayWeather.uvIndex) : { Icon: HelpCircle, description: "Loading..." };


  if (authLoading || (isLoadingWeather && !currentLocation)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 dark:from-slate-900 dark:via-sky-800 dark:to-blue-950 p-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-lg">Loading your climate health insights...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 dark:from-slate-900 dark:via-sky-800 dark:to-blue-950 p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1.5">Climate & Health</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm sm:text-base">Today's weather and potential health considerations.</p>
        </div>

        {isLoadingWeather && !todayWeather && (
             <div className="flex flex-col items-center justify-center min-h-[200px] text-center bg-white/20 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl shadow-xl p-4">
                <Loader2 className="h-10 w-10 animate-spin text-white/80 mb-3" />
                <p className="text-md text-slate-200 dark:text-slate-300">Fetching latest weather...</p>
            </div>
        )}

        {error && (
            <Card className="max-w-md mx-auto bg-red-500/30 dark:bg-red-700/40 backdrop-blur-md border border-red-400/50 rounded-2xl shadow-xl text-white" role="alert">
            <CardHeader className="flex flex-row items-center gap-3">
                <AlertTriangle className="h-7 w-7 text-red-100" />
                <CardTitle className="text-red-100 text-xl">Data Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-red-100">{error}</p>
                <p className="text-sm text-red-200/80 mt-2">
                Could not fetch weather or health prediction data. Please try refreshing later.
                </p>
            </CardContent>
            </Card>
        )}

        {currentLocation && todayWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Weather Card (Main Area) */}
            <Card className="lg:col-span-3 bg-white/20 dark:bg-slate-800/40 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/30 dark:border-slate-700/50 text-slate-100 dark:text-slate-50 overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                    <MapPin size={20} className="mr-2 opacity-80" /> {currentLocation.name}
                  </h2>
                  <p className="text-sm text-slate-200 dark:text-slate-300">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:justify-around text-center sm:text-left gap-6 mb-8">
                  <CurrentWeatherIcon className="w-28 h-28 sm:w-36 sm:h-36 text-white drop-shadow-lg" />
                  <div className="flex-shrink-0">
                    <p className="text-7xl sm:text-8xl font-bold tracking-tight">
                      {todayWeather.maxTemp ?? '--'}<span className="text-4xl sm:text-5xl align-top font-light tracking-normal">°C</span>
                    </p>
                    <p className="text-lg text-slate-200 dark:text-slate-300 -mt-2">{weatherDescription}</p>
                    {todayWeather.minTemp && 
                        <p className="text-sm text-slate-300 dark:text-slate-400 mt-1">Min: {todayWeather.minTemp}°C</p>
                    }
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center p-3 bg-white/10 dark:bg-slate-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-600/50">
                    <Sun className="h-6 w-6 text-yellow-300 mb-1" />
                    <p className="font-semibold text-lg">{todayWeather.uvIndex ?? 'N/A'}</p>
                    <p className="text-xs text-slate-200 dark:text-slate-300">UV Index</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white/10 dark:bg-slate-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-600/50">
                    <Droplet className="h-6 w-6 text-sky-300 mb-1" />
                    <p className="font-semibold text-lg">{todayWeather.precipitation ?? 'N/A'} mm</p>
                    <p className="text-xs text-slate-200 dark:text-slate-300">Precipitation</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white/10 dark:bg-slate-700/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-600/50 col-span-2 md:col-span-1">
                    <Wind className="h-6 w-6 text-slate-300 mb-1" />
                    <p className="font-semibold text-lg">~5 km/h</p> {/* Mock wind */}
                    <p className="text-xs text-slate-200 dark:text-slate-300">Wind (Est.)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Health Insights Card (Right Column) */}
            {healthPrediction && (
              <Card className="lg:col-span-2 bg-white/20 dark:bg-slate-800/40 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/30 dark:border-slate-700/50 text-slate-100 dark:text-slate-50">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <Zap className="mr-2.5 h-6 w-6 text-sky-300" />
                    AI Health Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pb-5">
                  {healthPrediction.message ? (
                    <div className="flex items-start p-3 bg-green-400/30 dark:bg-green-600/40 backdrop-blur-sm border border-green-300/40 dark:border-green-500/50 rounded-xl">
                      <ShieldCheck className="mr-3 h-5 w-5 text-green-100 dark:text-green-200 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-50 dark:text-green-100">{healthPrediction.message}</p>
                    </div>
                  ) : (
                    <>
                      {healthPrediction.diseases.length > 0 && (
                        <div className="p-3 bg-red-400/30 dark:bg-red-600/40 backdrop-blur-sm border border-red-300/40 dark:border-red-500/50 rounded-xl">
                          <h3 className="font-semibold text-red-100 dark:text-red-200 mb-1.5 flex items-center"><AlertTriangle size={16} className="mr-2"/>Potential Risks Today:</h3>
                          <ul className="list-disc list-inside pl-1 text-red-50 dark:text-red-100 text-sm space-y-0.5">
                            {healthPrediction.diseases.map((disease, index) => (
                              <li key={index}>{disease}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {healthPrediction.suggestions.length > 0 && (
                        <div className="p-3 bg-blue-400/30 dark:bg-blue-600/40 backdrop-blur-sm border border-blue-300/40 dark:border-blue-500/50 rounded-xl">
                          <h3 className="font-semibold text-blue-100 dark:text-blue-200 mb-1.5 flex items-center"><Info size={16} className="mr-2"/>Prevention Tips:</h3>
                          <ul className="list-disc list-inside pl-1 text-blue-50 dark:text-blue-100 text-sm space-y-0.5">
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
          </div>
        )}

         <Card className="bg-white/10 dark:bg-slate-800/30 backdrop-blur-md border-white/20 dark:border-slate-700/40 rounded-xl mt-8 shadow-md">
            <CardContent className="p-4">
                <p className="text-xs text-slate-200 dark:text-slate-300">
                <strong className="font-medium text-slate-50 dark:text-slate-100">Disclaimer:</strong> This forecast provides informational suggestions based on general weather patterns and is not a substitute for professional medical advice. Always consult a healthcare provider for health concerns. Weather data from Open-Meteo.
                </p>
                 {!userProfile?.latitude && !userProfile?.longitude && (
                    <p className="text-xs text-slate-200 dark:text-slate-300 mt-1.5">
                       For more accurate local predictions, please <Button variant="link" asChild className="p-0 h-auto text-xs text-sky-300 dark:text-sky-400 hover:text-sky-200"><Link href="/patient/settings/profile-info">update your profile</Link></Button> with your location.
                    </p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
