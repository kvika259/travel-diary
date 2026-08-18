import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import SearchBar from './SearchBar';
import styles from './TripTree.module.css';

export default function TripTree() {
  const { trips, countries, cities } = useTravel();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddTrip = () => {
    navigate('/trip/new');
  };

  const searchLower = search.toLowerCase();

  const tripsByCountry = trips.reduce((acc, trip) => {
    const country = countries.find((c) => c.id === trip.countryId);
    if (!country) return acc;

    if (!acc[country.id]) {
      acc[country.id] = { country, cities: {} };
    }

    const city = cities.find((c) => c.id === trip.cityId);
    const cityKey = city?.id || '__no_city';

    if (!acc[country.id].cities[cityKey]) {
      acc[country.id].cities[cityKey] = { city, trips: [] };
    }
    acc[country.id].cities[cityKey].trips.push(trip);
    return acc;
  }, {});

  const filteredCountries = Object.entries(tripsByCountry).filter(([, countryData]) => {
    if (!searchLower) return true;
    if (countryData.country.name.toLowerCase().includes(searchLower)) return true;
    return Object.values(countryData.cities).some((cityData) => {
      if (cityData.city?.name.toLowerCase().includes(searchLower)) return true;
      return cityData.trips.some(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          (t.description && t.description.toLowerCase().includes(searchLower))
      );
    });
  });

  return (
    <div>
      <div className={styles.topRow}>
        <SearchBar value={search} onChange={setSearch} placeholder="Поиск по воспоминаниям..." />
        <button className={styles.addBtn} onClick={handleAddTrip} title="Новое воспоминание">✚</button>
      </div>

      {filteredCountries.length === 0 && (
        <div className={styles.empty}>
          {search ? 'Ничего не найдено' : 'Нет воспоминаний. Создайте первое!'}
        </div>
      )}

      {filteredCountries.map(([countryId, { country, cities: countryCities }]) => {
        const countryKey = `country-${countryId}`;
        const isCountryExpanded = expanded[countryKey] !== false;

        return (
          <div key={countryId} className={styles.countryBlock}>
            <button
              className={styles.countryHeader}
              onClick={() => toggleExpand(countryKey)}
            >
              <span className={styles.arrow}>{isCountryExpanded ? '▼' : '▶'}</span>
              <span className={styles.emoji}>{country.emoji}</span>
              <span className={styles.countryName}>{country.name}</span>
            </button>

            {isCountryExpanded && (
              <div className={styles.cities}>
                {Object.entries(countryCities).map(([cityKey, { city, trips: cityTrips }]) => {
                  const cityBlockKey = `city-${cityKey}`;
                  const isCityExpanded = expanded[cityBlockKey] !== false;

                  return (
                    <div key={cityKey}>
                      <button
                        className={styles.cityHeader}
                        onClick={() => toggleExpand(cityBlockKey)}
                      >
                        <span className={styles.arrow}>{isCityExpanded ? '▼' : '▶'}</span>
                        <span>🏙️ {city?.name || 'Без города'}</span>
                      </button>

                      {isCityExpanded && (
                        <div className={styles.trips}>
                          {cityTrips.map((trip) => (
                            <Link
                              to={`/trip/${trip.id}`}
                              key={trip.id}
                              className={styles.tripCard}
                            >
                              <div className={styles.tripTitle}>📝 {trip.title}</div>
                              <div className={styles.tripMeta}>
                                {trip.dateFrom && `${trip.dateFrom} – `}
                                {trip.dateTo} · 📷 {trip.photos?.length || 0} фото
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
