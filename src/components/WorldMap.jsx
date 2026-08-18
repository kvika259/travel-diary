import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import MapView from './MapView';
import styles from './WorldMap.module.css';

function VisitedCountriesList({ countries, cities }) {
  const [expanded, setExpanded] = useState(true);
  const [expandedCities, setExpandedCities] = useState({});

  const visitedCountries = countries.filter((c) => c.visited);

  if (visitedCountries.length === 0) return null;

  const toggleCities = (countryId) => {
    setExpandedCities((prev) => ({ ...prev, [countryId]: !prev[countryId] }));
  };

  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setExpanded((p) => !p)}>
        <span className={styles.arrow}>{expanded ? '▼' : '▶'}</span>
        <span>📍 Посещённые страны ({visitedCountries.length})</span>
      </button>
      {expanded && (
        <div className={styles.countries}>
          {visitedCountries.map((country) => {
            const visitedCities = cities.filter(
              (c) => c.countryId === country.id && c.visited
            );
            const isCitiesOpen = expandedCities[country.id] !== false;

            return (
              <div key={country.id} className={styles.countryBlock}>
                <div className={styles.countryRow}>
                  {visitedCities.length > 0 && (
                    <button
                      className={styles.citiesToggle}
                      onClick={() => toggleCities(country.id)}
                    >
                      <span className={styles.arrow}>{isCitiesOpen ? '▼' : '▶'}</span>
                    </button>
                  )}
                  <Link to={`/country/${country.id}`} className={styles.countryName}>
                    {country.emoji} {country.name}
                    {visitedCities.length > 0 && (
                      <span className={styles.count}> · {visitedCities.length} гор.</span>
                    )}
                  </Link>
                </div>
                {isCitiesOpen && visitedCities.length > 0 && (
                  <div className={styles.cityList}>
                    {visitedCities.map((city) => (
                      <Link
                        key={city.id}
                        to={`/country/${country.id}/city/${city.id}`}
                        className={styles.cityLink}
                      >
                        ✔️ {city.name}
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
}

export default function WorldMap() {
  const { cities, countries } = useTravel();

  const markers = cities
    .filter((city) => city.visited)
    .map((city) => {
      const country = countries.find((c) => c.id === city.countryId);
      return {
        id: city.id,
        name: `${city.name}, ${country?.name || ''}`,
        coords: city.coords,
        visited: true,
        link: `/country/${city.countryId}/city/${city.id}`,
      };
    });

  return (
    <div>
      <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>🗺️ Карта мира</h2>
      <MapView
        markers={markers}
        center={{ lat: 30, lng: 20 }}
        zoom={2}
      />
      <VisitedCountriesList countries={countries} cities={cities} />
    </div>
  );
}
