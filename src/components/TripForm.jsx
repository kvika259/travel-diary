import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import SearchableSelect from './SearchableSelect';
import styles from './TripForm.module.css';

export default function TripForm() {
  const { cityId: urlCityId, countryId: urlCountryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addTrip, addCity, uploadPhoto, countries, fetchCitiesByCountry } = useTravel();

  const stateCountryId = location.state?.countryId || null;
  const stateCityId = location.state?.cityId || null;

  const initialCountryId = urlCountryId || stateCountryId || '';
  const initialCityId = urlCityId || stateCityId || '';

  const [countryId, setCountryId] = useState(initialCountryId);
  const [cityId, setCityId] = useState(initialCityId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [citiesForCountry, setCitiesForCountry] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);

  useEffect(() => {
    if (!countryId) {
      setCitiesForCountry([]);
      setCityId('');
      return;
    }
    fetchCitiesByCountry(countryId).then(setCitiesForCountry);
  }, [countryId, fetchCitiesByCountry]);

  useEffect(() => {
    if (countryId && !citiesForCountry.find((c) => c.id === cityId)) {
      setCityId('');
    }
  }, [countryId, citiesForCountry, cityId]);

  const handleCreateCity = async (name) => {
    try {
      await addCity({ countryId, name, coords: { lat: 0, lng: 0 } });
      const updated = await fetchCitiesByCountry(countryId);
      setCitiesForCountry(updated);
      const created = updated.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (created) setCityId(created.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !countryId) return;

    setSaving(true);
    try {
      const trip = await addTrip({
        cityId: cityId || null,
        countryId,
        title: title.trim(),
        description: description.trim(),
        dateFrom,
        dateTo,
      });

      const tripId = trip?.id || trip?._id;
      if (tripId && pendingPhotos.length > 0) {
        for (const file of pendingPhotos) {
          try {
            await uploadPhoto(tripId, file);
          } catch (err) {
            console.error('Photo upload failed:', err);
          }
        }
      }

      navigate(-1);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)}>←</button>
        <h2 className={styles.title}>Новое воспоминание</h2>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Страна *</label>
        <SearchableSelect
          value={countryId}
          onChange={setCountryId}
          placeholder="Начните вводить страну..."
          options={countries.map((c) => ({
            value: c.id,
            label: `${c.emoji} ${c.name}`,
            searchKey: c.name,
          }))}
        />
      </div>

      {countryId && citiesForCountry.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Город</label>
          <SearchableSelect
            value={cityId}
            onChange={setCityId}
            placeholder="Начните вводить город..."
            onCreate={handleCreateCity}
            options={citiesForCountry.map((c) => ({
              value: c.id,
              label: `🏙️ ${c.name}`,
              searchKey: c.name,
            }))}
          />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Заголовок *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          placeholder="Например: Рим — июнь 2025"
          autoFocus
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>С</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>По</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          placeholder="Что запомнилось, что понравилось..."
          rows={6}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Фото</label>
        <div className={styles.photos}>
          {pendingPhotos.map((file, i) => (
            <div key={i} className={styles.photoWrap}>
              <img src={URL.createObjectURL(file)} alt="" className={styles.photo} />
              <button
                type="button"
                className={styles.removePhoto}
                onClick={() => setPendingPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
          ))}
          <label className={styles.addPhoto}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setPendingPhotos((prev) => [...prev, ...files]);
                e.target.value = '';
              }}
              hidden
              multiple
            />
            <span className={styles.addPhotoIcon}>+</span>
            <span className={styles.addPhotoText}>Добавить фото</span>
          </label>
        </div>
      </div>

      <button type="submit" className={styles.submit} disabled={!title.trim() || !countryId || saving}>
        {saving ? 'Сохраняем...' : 'Сохранить'}
      </button>
    </form>
  );
}
