import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import SearchBar from './SearchBar';
import AddForm from './AddForm';
import styles from './CountryList.module.css';

export default function CountryList() {
  const { countryStats, loading } = useTravel();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = countryStats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalVisited = (c) => {
    const total = c.totalCities;
    if (total === 0) return c.visited ? 1 : 0;
    return c.visitedCities;
  };
  const totalItems = (c) => {
    const total = c.totalCities;
    if (total === 0) return 1;
    return total;
  };

  if (loading) {
    return <div className={styles.empty}>Загрузка стран...</div>;
  }

  return (
    <div>
      <div className={styles.hero}>
        <SearchBar value={search} onChange={setSearch} placeholder="Поиск по странам..." />
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          + Страна
        </button>
      </div>

      {showAdd && (
        <AddForm
          type="country"
          onClose={() => setShowAdd(false)}
        />
      )}

      <div className={styles.list}>
        {filtered.map((c) => (
          <Link to={`/country/${c.id}`} key={c.id} className={styles.card}>
            <div className={styles.cardLeft}>
              <span className={styles.emoji}>{c.emoji}</span>
              <div>
                <div className={styles.name}>{c.name}</div>
                <div className={styles.meta}>
                  {totalVisited(c)}/{totalItems(c)} городов · 📝 {c.tripCount}
                </div>
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.progress}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: totalItems(c) > 0
                      ? `${Math.round((totalVisited(c) / totalItems(c)) * 100)}%`
                      : c.visited ? '100%' : '0%',
                  }}
                />
              </div>
              <span className={styles.arrow}>→</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}>Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
