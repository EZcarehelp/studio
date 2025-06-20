
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
     if (weather.uvIndex === null || weather.uvIndex <= 7) {
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
  if (weather.rain !== null && weather.rain > 0.5 && weather.rain <=5) {
     diseases.push("Possible Cold/Flu Risk due to Rain");
     suggestions.push("Stay warm and dry. Maintain good hygiene. Consider indoor activities if rain is heavy.");
  }

  if (weather.maxTemp !== null && weather.maxTemp < 15) {
    diseases.push("Cold Weather Ailments");
    suggestions.push("Dress in layers, protect extremities. Be cautious of flu and respiratory issues. Ensure adequate indoor heating if needed.");
  }
  
  if (weather.uvIndex !== null && weather.uvIndex > 5 && weather.maxTemp !== null && weather.maxTemp < 25 && (weather.rain === null || weather.rain < 1)) {
    diseases.push("Potential for Pollen/Allergy Flare-up");
    suggestions.push("Weather might be conducive to high pollen counts. If you have allergies, monitor local pollen levels and take precautions.");
  }

  return diseases.length > 0
    ? { diseases, suggestions }
    : { diseases: [], suggestions: [], message: "No specific climate-related health risks prominently predicted for today. Maintain general wellness practices." };
}

interface ProcessedDailyWeather {
  maxTemp: number | null;
  minTemp: number | null;
  precipitation: number | null;
  uvIndex: number | null;
}

function getWeatherIcon(maxTemp: number | null, rain: number | null, uvIndex: number | null): { Icon: React.ElementType, color: string } {
    if (rain !== null && rain > 1) return { Icon: CloudRain, color: "text-blue-400 dark:text-blue-300" };
    if (maxTemp !== null && maxTemp > 30) return { Icon: Sun, color: "text-yellow-400 dark:text-yellow-300" };
    if (uvIndex !== null && uvIndex > 5 && (rain === null || rain < 0.5)) return { Icon: Sun, color: "text-yellow-400 dark:text-yellow-300" };
    return { Icon: CloudSun, color: "text-sky-400 dark:text-sky-300" };
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
            maxTemp: getDailyValue(0), // temperature_2m_max
            minTemp: getDailyValue(1), // temperature_2m_min
            precipitation: getDailyValue(2), // precipitation_sum
            uvIndex: getDailyValue(3), // uv_index_max
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
  
  const { Icon: WeatherIcon, color: weatherIconColor } = todayWeather ? getWeatherIcon(todayWeather.maxTemp, todayWeather.precipitation, todayWeather.uvIndex) : { Icon: HelpCircle, color: "text-slate-500 dark:text-slate-400" };


  if (authLoading || (isLoadingWeather && !currentLocation)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center bg-slate-100 dark:bg-slate-950 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-accent mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">Loading your climate health insights...</p>
      </div>
    );
  }


  return (
    <div className="bg-slate-100 dark:bg-[#0D1117] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-1.5">Climate & Health</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Today's weather and potential health considerations for {currentLocation?.name || 'your location'}.</p>
        </div>

        {isLoadingWeather && !todayWeather && (
             <div className="flex flex-col items-center justify-center min-h-[200px] text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-accent mb-3" />
                <p className="text-md text-slate-500 dark:text-slate-400">Fetching latest weather...</p>
            </div>
        )}

        {error && (
            <Card className="max-w-md mx-auto border-red-500 bg-red-50 dark:bg-red-900/40 rounded-2xl shadow-xl" role="alert">
            <CardHeader className="flex flex-row items-center gap-3">
                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
                <CardTitle className="text-red-700 dark:text-red-300 text-xl">Data Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-2">
                Could not fetch weather or health prediction data. Please try refreshing later.
                </p>
            </CardContent>
            </Card>
        )}


        {currentLocation && todayWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weather Card (Left/Middle Column) */}
            <Card className="lg:col-span-2 bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{currentLocation.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-6">
                  <div className="text-center sm:text-left">
                    <p className="text-7xl sm:text-8xl font-black text-slate-800 dark:text-slate-50 tracking-tighter -ml-1">
                      {todayWeather.maxTemp ?? '--'}<span className="text-4xl sm:text-5xl align-top font-light -ml-1">°C</span>
                    </p>
                    {todayWeather.minTemp && 
                        <p className="text-md text-slate-500 dark:text-slate-400 ml-1">Min: {todayWeather.minTemp}°C</p>
                    }
                  </div>
                  <WeatherIcon className={cn("h-28 w-28 sm:h-36 sm:w-36 opacity-90", weatherIconColor)} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600/50">
                    <Sun className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mb-1" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{todayWeather.uvIndex ?? 'N/A'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">UV Index</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600/50">
                    <CloudRain className="h-6 w-6 text-blue-500 dark:text-blue-400 mb-1" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{todayWeather.precipitation ?? 'N/A'} mm</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Precipitation</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600/50 col-span-2 md:col-span-1">
                    <Wind className="h-6 w-6 text-sky-500 dark:text-sky-400 mb-1" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">5 km/h</p> {/* Mock wind */}
                    <p className="text-xs text-slate-500 dark:text-slate-400">Wind (mock)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Health Insights Card (Right Column) */}
            {healthPrediction && (
              <Card className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
                    <Zap className="mr-2.5 h-6 w-6 text-primary dark:text-accent" />
                    AI Health Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2 pb-5">
                  {healthPrediction.message ? (
                    <div className="flex items-start p-3 bg-green-50 dark:bg-green-700/30 border border-green-200 dark:border-green-600/50 rounded-md">
                      <ShieldCheck className="mr-3 h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700 dark:text-green-300">{healthPrediction.message}</p>
                    </div>
                  ) : (
                    <>
                      {healthPrediction.diseases.length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-700/30 border border-red-200 dark:border-red-600/50 rounded-md">
                          <h3 className="font-semibold text-red-700 dark:text-red-300 mb-1.5 flex items-center"><AlertTriangle size={16} className="mr-2"/>Risks Today:</h3>
                          <ul className="list-disc list-inside pl-1 text-red-600 dark:text-red-400 text-sm space-y-0.5">
                            {healthPrediction.diseases.map((disease, index) => (
                              <li key={index}>{disease}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {healthPrediction.suggestions.length > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-700/30 border border-blue-200 dark:border-blue-600/50 rounded-md">
                          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-1.5 flex items-center"><Info size={16} className="mr-2"/>Prevention:</h3>
                          <ul className="list-disc list-inside pl-1 text-blue-600 dark:text-blue-400 text-sm space-y-0.5">
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

         <Card className="bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg mt-8">
            <CardContent className="p-4">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong className="font-medium text-slate-700 dark:text-slate-300">Disclaimer:</strong> This forecast provides informational suggestions based on general weather patterns and is not a substitute for professional medical advice. Always consult a healthcare provider for health concerns. Weather data from Open-Meteo.
                </p>
                 {!userProfile?.latitude && !userProfile?.longitude && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                       For more accurate local predictions, please <Button variant="link" asChild className="p-0 h-auto text-xs text-primary dark:text-accent"><Link href="/patient/settings/profile-info">update your profile</Link></Button> with your location.
                    </p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

