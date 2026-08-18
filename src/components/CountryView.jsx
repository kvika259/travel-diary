import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import MapView from './MapView';
import AddForm from './AddForm';
import styles from './CountryView.module.css';

function VisitedCitiesList({ cities, countryId }) {
  const [expanded, setExpanded] = useState(true);
  const visited = cities.filter((c) => c.visited);

  if (visited.length === 0) return null;

  return (
    <div className={styles.visitedSection}>
      <button className={styles.visitedHeader} onClick={() => setExpanded((p) => !p)}>
        <span className={styles.arrow}>{expanded ? '▼' : '▶'}</span>
        <span>📍 Посещённые города ({visited.length})</span>
      </button>
      {expanded && (
        <div className={styles.visitedList}>
          {visited.map((city) => (
            <Link
              key={city.id}
              to={`/country/${countryId}/city/${city.id}`}
              className={styles.visitedCity}
            >
              ✔️ {city.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CountryView() {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const { countries, toggleCountryVisited, fetchCountry } = useTravel();
  const [tab, setTab] = useState('cities');
  const [showAdd, setShowAdd] = useState(false);
  const [countryDetail, setCountryDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCountry(countryId).then((data) => {
      if (!cancelled) {
        setCountryDetail(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [countryId, fetchCountry, refreshKey]);

  if (loading) return <div className={styles.notFound}>Загрузка...</div>;
  if (!countryDetail) return <div className={styles.notFound}>Страна не найдена</div>;

  const country = countryDetail;
  const cities = country.cities || [];
  const countryTrips = country.trips || [];

  return (
    <div>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/')}>←</button>
        <span className={styles.emoji}>{country.emoji}</span>
        <h2 className={styles.title}>{country.name}</h2>
        <label className={styles.visited}>
          <input
            type="checkbox"
            checked={country.visited}
            onChange={async () => {
              await toggleCountryVisited(countryId);
              setCountryDetail((prev) => prev ? { ...prev, visited: !prev.visited } : prev);
            }}
          />
          ✔️ Посетил
        </label>
      </div>

      <div className={styles.tabs}>
        <button
          className={tab === 'cities' ? styles.tabActive : styles.tab}
          onClick={() => setTab('cities')}
        >
          🏙️ Города ({cities.length})
        </button>
        <button
          className={tab === 'map' ? styles.tabActive : styles.tab}
          onClick={() => setTab('map')}
        >
          🗺️ Карта
        </button>
        <button
          className={tab === 'trips' ? styles.tabActive : styles.tab}
          onClick={() => setTab('trips')}
        >
          📝 Воспоминания ({countryTrips.length})
        </button>
      </div>

      {tab === 'cities' && (
        <div>
          <div className={styles.sectionHeader}>
            <span>Города:</span>
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              + Город
            </button>
          </div>
          {showAdd && (
            <AddForm
              type="city"
              countryId={countryId}
              onClose={() => { setShowAdd(false); setRefreshKey((k) => k + 1); }}
            />
          )}
          <div className={styles.list}>
            {cities.map((city) => (
              <Link
                to={`/country/${countryId}/city/${city.id}`}
                key={city.id}
                className={styles.card}
              >
                <div className={styles.cardLeft}>
                  <span className={styles.check}>{city.visited ? '✔️' : '☐'}</span>
                  <div>
                    <div className={styles.cityName}>{city.name}</div>
                    <div className={styles.cityMeta}>
                      {city.visitedAttrs}/{city.totalAttrs} дост. · 📝 {city.tripCount}
                    </div>
                  </div>
                </div>
                <span className={styles.arrow}>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === 'map' && (
        <>
          <MapView
            markers={cities
              .filter((city) => city.visited)
              .map((city) => ({
                id: city.id,
                name: city.name,
                coords: city.coords,
                visited: true,
                link: `/country/${countryId}/city/${city.id}`,
              }))}
            center={country.coords}
            zoom={6}
          />
          <VisitedCitiesList cities={cities} countryId={countryId} />
        </>
      )}

      {tab === 'trips' && (
        <div className={styles.trips}>
          {countryTrips.length === 0 && (
            <div className={styles.empty}>Нет воспоминаний для этой страны</div>
          )}
          {countryTrips.map((trip) => (
            <Link
              to={`/trip/${trip.id}`}
              key={trip.id}
              className={styles.tripCard}
            >
              <div className={styles.tripTitle}>
                📝 {trip.title}
                {trip.cityName && <span className={styles.tripCity}> — {trip.cityName}</span>}
              </div>
              <div className={styles.tripMeta}>
                {trip.dateFrom} – {trip.dateTo} · 📷 {trip.photos?.length || 0} фото
              </div>
            </Link>
          ))}
          <button
            className={styles.newTripBtn}
            onClick={() => navigate(`/trip/new`, { state: { countryId } })}
          >
            + Воспоминание
          </button>
        </div>
      )}
    </div>
  );
}
