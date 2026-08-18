import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const TravelContext = createContext(null);

function normalize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const { _id, __v, ...rest } = obj;
  const result = { id: _id?.toString?.() || _id, ...rest };
  for (const key of Object.keys(result)) {
    if (Array.isArray(result[key])) {
      result[key] = result[key].map((item) =>
        item && typeof item === 'object' ? normalize(item) : item
      );
    }
  }
  return result;
}

export function TravelProvider({ children }) {
  const { apiFetch, isAuthenticated } = useAuth();
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setCountries([]);
      setCities([]);
      setTrips([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [countriesData, citiesData, tripsData] = await Promise.all([
          apiFetch('/countries'),
          apiFetch('/cities'),
          apiFetch('/trips'),
        ]);

        if (!cancelled) {
          setCountries(countriesData.filter(Boolean).map(normalize));
          setCities(citiesData.filter(Boolean).map(normalize));
          setTrips(tripsData.filter(Boolean).map(normalize));
        }
      } catch (err) {
        console.error('Failed to load travel data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [isAuthenticated, apiFetch]);

  const refreshCountries = useCallback(async () => {
    try {
      const data = await apiFetch('/countries');
      const normalized = data.filter(Boolean).map(normalize);
      setCountries((prev) => {
        const localVisited = {};
        prev.filter(Boolean).forEach((c) => { if (c.visited) localVisited[c.id] = true; });
        return normalized.map((c) => ({
          ...c,
          visited: localVisited[c.id] || c.visited || false,
        }));
      });
    } catch (err) { console.error(err); }
  }, [apiFetch]);

  const refreshCities = useCallback(async () => {
    try {
      const data = await apiFetch('/cities');
      const normalized = data.filter(Boolean).map(normalize);
      setCities((prev) => {
        const localVisited = {};
        prev.filter(Boolean).forEach((c) => { if (c.visited) localVisited[c.id] = true; });
        return normalized.map((c) => ({
          ...c,
          visited: localVisited[c.id] || c.visited || false,
        }));
      });
    } catch (err) { console.error(err); }
  }, [apiFetch]);

  const refreshTrips = useCallback(async () => {
    try {
      const data = await apiFetch('/trips');
      setTrips(data.map(normalize));
    } catch (err) { console.error(err); }
  }, [apiFetch]);

  const addCountry = useCallback(async ({ name, emoji, coords }) => {
    await apiFetch('/countries', {
      method: 'POST',
      body: JSON.stringify({ name, emoji, coords }),
    });
    await refreshCountries();
  }, [apiFetch, refreshCountries]);

  const addCity = useCallback(async ({ countryId, name, coords }) => {
    await apiFetch('/cities', {
      method: 'POST',
      body: JSON.stringify({ countryId, name, coords }),
    });
    await refreshCities();
    await refreshCountries();
  }, [apiFetch, refreshCities, refreshCountries]);

  const addAttraction = useCallback(async ({ cityId, name }) => {
    await apiFetch('/attractions', {
      method: 'POST',
      body: JSON.stringify({ cityId, name }),
    });
  }, [apiFetch]);

  const toggleCountryVisited = useCallback(async (countryId) => {
    const result = await apiFetch(`/countries/${countryId}/visited`, { method: 'PATCH' });
    setCountries((prev) =>
      prev.map((c) => c.id === countryId ? { ...c, visited: result.visited || false } : c)
    );
    return result;
  }, [apiFetch]);

  const toggleCityVisited = useCallback(async (cityId) => {
    const result = await apiFetch(`/cities/${cityId}/visited`, { method: 'PATCH' });
    setCities((prev) =>
      prev.map((c) => c.id === cityId ? { ...c, visited: result.visited || false } : c)
    );
    if (result.countryId) {
      setCountries((prev) =>
        prev.map((c) => c.id === result.countryId ? { ...c, visited: result.visited || false } : c)
      );
    }
    await refreshCountries();
    return result;
  }, [apiFetch, refreshCountries]);

  const toggleAttractionVisited = useCallback(async (attractionId) => {
    const result = await apiFetch(`/attractions/${attractionId}/visited`, { method: 'PATCH' });
    if (result.visited) {
      await refreshCities();
      await refreshCountries();
    }
    return result;
  }, [apiFetch, refreshCities, refreshCountries]);

  const addTrip = useCallback(async ({ cityId, countryId, title, description, dateFrom, dateTo }) => {
    const data = await apiFetch('/trips', {
      method: 'POST',
      body: JSON.stringify({ cityId: cityId || null, countryId: countryId || null, title, description, dateFrom, dateTo }),
    });
    await refreshTrips();
    await refreshCountries();
    return normalize(data);
  }, [apiFetch, refreshTrips, refreshCountries]);

  const updateTrip = useCallback(async (tripId, updates) => {
    await apiFetch(`/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await refreshTrips();
  }, [apiFetch, refreshTrips]);

  const deleteTrip = useCallback(async (tripId) => {
    await apiFetch(`/trips/${tripId}`, { method: 'DELETE' });
    await refreshTrips();
    await refreshCountries();
  }, [apiFetch, refreshTrips, refreshCountries]);

  const uploadPhoto = useCallback(async (tripId, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const token = localStorage.getItem('travel-diary-token');
    const res = await fetch(`http://localhost:3000/api/trips/${tripId}/photos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Ошибка загрузки фото');
    }
    await refreshTrips();
    return res.json();
  }, [refreshTrips]);

  const deletePhoto = useCallback(async (tripId, photoId) => {
    await apiFetch(`/trips/${tripId}/photos/${photoId}`, { method: 'DELETE' });
    await refreshTrips();
  }, [apiFetch, refreshTrips]);

  const getPhotoUrl = useCallback((tripId, photoId) => {
    const token = localStorage.getItem('travel-diary-token');
    return `http://localhost:3000/api/trips/${tripId}/photos/${photoId}?token=${token}`;
  }, []);

  const fetchCountry = useCallback(async (countryId) => {
    const data = await apiFetch(`/countries/${countryId}`);
    return normalize(data);
  }, [apiFetch]);

  const fetchCity = useCallback(async (cityId) => {
    const data = await apiFetch(`/cities/${cityId}`);
    return normalize(data);
  }, [apiFetch]);

  const fetchTrip = useCallback(async (tripId) => {
    const data = await apiFetch(`/trips/${tripId}`);
    return normalize(data);
  }, [apiFetch]);

  const fetchCitiesByCountry = useCallback(async (countryId) => {
    const data = await apiFetch(`/cities?countryId=${countryId}`);
    return data.map(normalize);
  }, [apiFetch]);

  const countryStats = useMemo(() => countries, [countries]);

  const value = useMemo(() => ({
    countries,
    cities,
    trips,
    countryStats,
    loading,
    addCountry,
    addCity,
    addAttraction,
    toggleCountryVisited,
    toggleCityVisited,
    toggleAttractionVisited,
    addTrip,
    updateTrip,
    deleteTrip,
    uploadPhoto,
    deletePhoto,
    getPhotoUrl,
    fetchCountry,
    fetchCity,
    fetchTrip,
    fetchCitiesByCountry,
    refreshCountries,
    refreshCities,
    refreshTrips,
  }), [
    countries, cities, trips, countryStats, loading,
    addCountry, addCity, addAttraction,
    toggleCountryVisited, toggleCityVisited, toggleAttractionVisited,
    addTrip, updateTrip, deleteTrip,
    uploadPhoto, deletePhoto, getPhotoUrl,
    fetchCountry, fetchCity, fetchTrip, fetchCitiesByCountry,
    refreshCountries, refreshCities, refreshTrips,
  ]);

  return (
    <TravelContext.Provider value={value}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error('useTravel must be used within TravelProvider');
  return ctx;
}
