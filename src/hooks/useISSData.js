import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchISSPosition, fetchAstronauts, fetchLocationName } from '../services/issService';
import { calculateSpeed } from '../utils/haversine';

export function useISSData() {
  const [position, setPosition] = useState(null);
  const [altitude, setAltitude] = useState(0);
  const [path, setPath] = useState([]);
  const [pathLength, setPathLength] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [locationName, setLocationName] = useState('Fetching...');
  const [astronauts, setAstronauts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(15);

  const prevPositionRef = useRef(null);
  const countdownRef = useRef(null);

  const startCountdown = useCallback(() => {
    setCountdown(15);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 15;
        return prev - 1;
      });
    }, 1000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const posData = await fetchISSPosition();
      const newPos = { lat: posData.lat, lng: posData.lon, timestamp: posData.timestamp };

      setPosition(newPos);
      setAltitude(posData.altitude || 0);

      setPath(prevPath => {
        const updatedPath = [...prevPath, [newPos.lat, newPos.lng]];
        const capped = updatedPath.length > 15 ? updatedPath.slice(updatedPath.length - 15) : updatedPath;
        setPathLength(updatedPath.length); // track total positions ever recorded
        return capped;
      });

      // Calculate speed using Haversine
      if (prevPositionRef.current) {
        const timeDiff = newPos.timestamp - prevPositionRef.current.timestamp;
        const speed = calculateSpeed(
          prevPositionRef.current.lat,
          prevPositionRef.current.lng,
          newPos.lat,
          newPos.lng,
          timeDiff
        );

        if (timeDiff > 0 && speed >= 0) {
          const validSpeed = speed > 40000 ? 27600 : speed;
          setCurrentSpeed(validSpeed);
          setSpeedHistory(prev => {
            const entry = {
              time: new Date(newPos.timestamp * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
              }),
              speed: Math.round(validSpeed)
            };
            const updated = [...prev, entry];
            return updated.length > 30 ? updated.slice(updated.length - 30) : updated;
          });
        }
      } else {
        // Use velocity from API if available (wheretheiss.at provides this in km/s)
        const apiSpeed = posData.velocity ? posData.velocity * 3.6 : 27600; // convert km/s to km/h
        setCurrentSpeed(apiSpeed);
      }

      prevPositionRef.current = newPos;

      // Reverse geocoding
      const locName = await fetchLocationName(newPos.lat, newPos.lng);
      setLocationName(locName);

      setLoading(false);
      setError(null);
      startCountdown();
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ISS data. Check network or API status.');
      setLoading(false);
    }
  }, [startCountdown]);

  useEffect(() => {
    fetchData();
    fetchAstronauts().then(data => setAstronauts(data)).catch(console.error);

    const interval = setInterval(fetchData, 15000);

    return () => {
      clearInterval(interval);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchData]);

  return {
    position,
    altitude,
    path,
    pathLength,
    currentSpeed,
    speedHistory,
    locationName,
    astronauts,
    loading,
    error,
    countdown,
    refetch: fetchData,
  };
}
