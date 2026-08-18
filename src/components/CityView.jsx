import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import AddForm from './AddForm';
import { formatDate } from '../utils/formatDate';
import styles from './CityView.module.css';

export default function CityView() {
  const { countryId, cityId } = useParams();
  const navigate = useNavigate();
  const { countries, toggleCityVisited, toggleAttractionVisited, fetchCity } = useTravel();
  const [tab, setTab] = useState('attractions');
  const [showAddAttr, setShowAddAttr] = useState(false);
  const [cityDetail, setCityDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const country = countries.find((c) => c.id === countryId);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCity(cityId).then((data) => {
      if (!cancelled) {
        setCityDetail(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [cityId, fetchCity, refreshKey]);

  if (loading) return <div className={styles.notFound}>Загрузка...</div>;
  if (!cityDetail) return <div className={styles.notFound}>Город не найден</div>;

  const city = cityDetail;
  const attractions = city.attractions || [];
  const cityTrips = city.trips || [];

  const handleToggleAttr = async (attractionId) => {
    try {
      const result = await toggleAttractionVisited(attractionId);
      setCityDetail((prev) => {
        if (!prev) return prev;
        const updatedAttrs = (prev.attractions || []).map((a) =>
          a.id === attractionId ? { ...a, visited: result.visited } : a
        );
        return { ...prev, attractions: updatedAttrs, visited: result.visited ? true : prev.visited };
      });
    } catch (err) {
      console.error('Ошибка при изменении достопримечательности:', err);
    }
  };

  const handleToggleCity = async () => {
    try {
      const result = await toggleCityVisited(cityId);
      setCityDetail((prev) => prev ? { ...prev, visited: result.visited } : prev);
    } catch (err) {
      console.error('Ошибка при изменении города:', err);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(`/country/${countryId}`)}>←</button>
        <div>
          <h2 className={styles.title}>{city.name}</h2>
          <div className={styles.subtitle}>{country?.emoji} {country?.name}</div>
        </div>
        <label className={styles.visited}>
          <input
            type="checkbox"
            checked={city.visited}
            onChange={handleToggleCity}
          />
          ✔️ Посетил
        </label>
      </div>

      <div className={styles.tabs}>
        <button
          className={tab === 'attractions' ? styles.tabActive : styles.tab}
          onClick={() => setTab('attractions')}
        >
          🏛️ Достопримеч. ({attractions.length})
        </button>
        <button
          className={tab === 'trips' ? styles.tabActive : styles.tab}
          onClick={() => setTab('trips')}
        >
          📝 Воспоминания ({cityTrips.length})
        </button>
      </div>

      {tab === 'attractions' && (
        <div>
          <div className={styles.sectionHeader}>
            <span>Достопримечательности:</span>
            <button className={styles.addBtn} onClick={() => setShowAddAttr(true)}>
              + Добавить
            </button>
          </div>
          {showAddAttr && (
            <AddForm
              type="attraction"
              cityId={cityId}
              onClose={() => { setShowAddAttr(false); setRefreshKey((k) => k + 1); }}
            />
          )}
          <div className={styles.list}>
            {attractions.map((attr) => (
              <div key={attr.id} className={styles.item}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={attr.visited}
                    onChange={() => handleToggleAttr(attr.id)}
                  />
                  <span className={styles.checkMark}>{attr.visited ? '✔️' : '☐'}</span>
                  <span className={styles.attrName}>{attr.name}</span>
                </label>
              </div>
            ))}
            {attractions.length === 0 && (
              <div className={styles.empty}>Нет достопримечательностей</div>
            )}
          </div>
        </div>
      )}

      {tab === 'trips' && (
        <div>
          <div className={styles.trips}>
            {cityTrips.map((trip) => (
              <Link to={`/trip/${trip.id}`} key={trip.id} className={styles.tripCard}>
                <div className={styles.tripTitle}>📝 {trip.title}</div>
                <div className={styles.tripMeta}>
                  {formatDate(trip.dateFrom)} – {formatDate(trip.dateTo)} · 📷 {trip.photos?.length || 0} фото
                </div>
                {trip.description && (
                  <div className={styles.tripDesc}>
                    {trip.description.slice(0, 80)}
                    {trip.description.length > 80 ? '...' : ''}
                  </div>
                )}
              </Link>
            ))}
            {cityTrips.length === 0 && (
              <div className={styles.empty}>Нет воспоминаний для этого города</div>
            )}
            <button
              className={styles.newTripBtn}
              onClick={() => navigate(`/trip/new`, { state: { cityId, countryId } })}
            >
              + Воспоминание
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
