export async function fetchISSPosition() {
  // Using wheretheiss.at as it supports HTTPS (open-notify uses HTTP which fails in production)
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  if (!response.ok) throw new Error('Failed to fetch ISS position');
  const data = await response.json();
  return {
    lat: parseFloat(data.latitude),
    lon: parseFloat(data.longitude),
    timestamp: data.timestamp,
    altitude: data.altitude,
    velocity: data.velocity,
  };
}

export async function fetchAstronauts() {
  // Using a CORS-friendly proxy since open-notify.org only serves HTTP
  try {
    const response = await fetch('https://corsproxy.io/?https://api.open-notify.org/astros.json');
    if (!response.ok) throw new Error('Failed to fetch astronauts');
    const data = await response.json();
    return data;
  } catch (e) {
    // Fallback data in case proxy fails
    return { number: 7, people: [
      { name: 'Oleg Kononenko', craft: 'ISS' },
      { name: 'Nikolai Chub', craft: 'ISS' },
      { name: 'Tracy Dyson', craft: 'ISS' },
      { name: 'Matthew Dominick', craft: 'ISS' },
      { name: 'Michael Barratt', craft: 'ISS' },
      { name: 'Jeanette Epps', craft: 'ISS' },
      { name: 'Alexander Grebenkin', craft: 'ISS' },
    ]};
  }
}

export async function fetchLocationName(lat, lon) {
  try {
    // Adding a short delay or caching might be needed to avoid rate limits
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    
    if (data.error) {
      return "Over Ocean / Uncharted";
    }

    const address = data.address;
    if (address) {
      const city = address.city || address.town || address.village || address.county;
      const country = address.country;
      if (city && country) return `${city}, ${country}`;
      if (country) return country;
      if (city) return city;
    }
    return data.display_name || "Unknown Location";
  } catch (error) {
    console.error("Error fetching location name:", error);
    return "Over Ocean / Uncharted";
  }
}
