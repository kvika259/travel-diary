import { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import styles from './AddForm.module.css';

export default function AddForm({ type, countryId, cityId, onClose }) {
  const { addCountry, addCity, addAttraction } = useTravel();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌍');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      if (type === 'country') {
        await addCountry({
          name: name.trim(),
          emoji,
          coords: { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 },
        });
      } else if (type === 'city') {
        await addCity({
          countryId,
          name: name.trim(),
          coords: { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 },
        });
      } else if (type === 'attraction') {
        await addAttraction({ cityId, name: name.trim() });
      }
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.heading}>
        {type === 'country' && 'Новая страна'}
        {type === 'city' && 'Новый город'}
        {type === 'attraction' && 'Новая достопримечательность'}
      </h3>

      {type === 'country' && (
        <div className={styles.emojiRow}>
          <label>Эмодзи:</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className={styles.emojiInput}
            maxLength={4}
          />
        </div>
      )}

      <input
        type="text"
        placeholder={
          type === 'country' ? 'Название страны' :
          type === 'city' ? 'Название города' :
          'Название достопримечательности'
        }
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
        autoFocus
      />

      {(type === 'country' || type === 'city') && (
        <div className={styles.coords}>
          <input
            type="number"
            placeholder="Широта (lat)"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            step="any"
            className={styles.coordInput}
          />
          <input
            type="number"
            placeholder="Долгота (lng)"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            step="any"
            className={styles.coordInput}
          />
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" onClick={onClose} className={styles.cancelBtn}>
          Отмена
        </button>
        <button type="submit" className={styles.submitBtn} disabled={!name.trim() || submitting}>
          {submitting ? 'Добавляем...' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
