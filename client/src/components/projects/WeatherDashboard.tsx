import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Cloud, CloudRain, Sun, Wind } from "lucide-react";

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

export default function WeatherDashboard() {
  const [city, setCity] = useState("San Francisco");
  const [searchQuery, setSearchQuery] = useState(city);

  const { data: weather, isLoading, isError, error } = useQuery<WeatherData>({
    queryKey: ["/api/weather", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        // Try to extract error message from response
        let errorMessage = "Failed to fetch weather data";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response isn't JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(`${errorMessage} (${response.status})`);
      }
      return response.json();
    },
    enabled: !!searchQuery,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(city);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "rain":
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      case "clouds":
        return <Cloud className="h-12 w-12 text-gray-500" />;
      case "clear":
        return <Sun className="h-12 w-12 text-yellow-500" />;
      default:
        return <Cloud className="h-12 w-12 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-2/3" />
                <div className="h-24 bg-muted rounded" />
                <div className="h-8 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <p className="text-destructive text-center font-semibold">
                  Failed to load weather data
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  {error instanceof Error 
                    ? error.message 
                    : "An unexpected error occurred. Please try again later."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery(city)}
                  className="w-full max-w-xs"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : weather ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{weather.name}</h2>
                  {getWeatherIcon(weather.weather[0].main)}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-4xl font-bold">
                      {Math.round(weather.main.temp)}°F
                    </p>
                    <p className="text-muted-foreground">
                      {weather.weather[0].description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-500" />
                      <span>Wind: {weather.wind.speed} mph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-blue-500" />
                      <span>Humidity: {weather.main.humidity}%</span>
                    </div>
                    <div>
                      Feels like: {Math.round(weather.main.feels_like)}°F
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
