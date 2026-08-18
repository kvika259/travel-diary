import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import styles from './TripView.module.css';

export default function TripView() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { countries, fetchTrip, updateTrip, deleteTrip, uploadPhoto, deletePhoto, getPhotoUrl } = useTravel();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTrip(tripId).then((data) => {
      if (!cancelled) {
        setTrip(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [tripId, fetchTrip]);

  if (loading) return <div className={styles.notFound}>Загрузка...</div>;
  if (!trip) return <div className={styles.notFound}>Воспоминание не найдено</div>;

  const country = countries.find((c) => c.id === trip.countryId);

  const startEditing = () => {
    setEditData({
      title: trip.title,
      description: trip.description || '',
      dateFrom: trip.dateFrom || '',
      dateTo: trip.dateTo || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateTrip(tripId, editData);
    setTrip((prev) => ({ ...prev, ...editData }));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Удалить это воспоминание?')) {
      await deleteTrip(tripId);
      navigate(-1);
    }
  };

  const handlePhotoAdd = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const result = await uploadPhoto(tripId, file);
        setTrip((prev) => ({
          ...prev,
          photos: [...(prev.photos || []), result.photoId],
        }));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const removePhoto = async (photoId) => {
    await deletePhoto(tripId, photoId);
    setTrip((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((p) => p !== photoId && p._id !== photoId),
    }));
  };

  return (
    <div>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>←</button>
        <div className={styles.headerRight}>
          {!isEditing && (
            <>
              <button className={styles.editBtn} onClick={startEditing}>✏️</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>🗑️</button>
            </>
          )}
        </div>
      </div>

      <div className={styles.meta}>
        {trip.cityName && (
          <Link to={`/country/${trip.countryId}/city/${trip.cityId}`} className={styles.location}>
            📍 {trip.cityName}, {country?.emoji} {country?.name}
          </Link>
        )}
        {!trip.cityName && country && (
          <span className={styles.location}>
            📍 {country.emoji} {country.name}
          </span>
        )}
        {!trip.cityName && trip.countryName && (
          <span className={styles.location}>
            📍 {trip.countryEmoji} {trip.countryName}
          </span>
        )}
      </div>

      {isEditing ? (
        <div className={styles.editForm}>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className={styles.editInput}
            placeholder="Заголовок"
          />
          <div className={styles.editDates}>
            <div>
              <label className={styles.editLabel}>С</label>
              <input
                type="date"
                value={editData.dateFrom}
                onChange={(e) => setEditData({ ...editData, dateFrom: e.target.value })}
                className={styles.editInput}
              />
            </div>
            <div>
              <label className={styles.editLabel}>По</label>
              <input
                type="date"
                value={editData.dateTo}
                onChange={(e) => setEditData({ ...editData, dateTo: e.target.value })}
                className={styles.editInput}
              />
            </div>
          </div>
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className={styles.editTextarea}
            placeholder="Описание"
            rows={6}
          />
          <div className={styles.editActions}>
            <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Отмена</button>
            <button className={styles.saveBtn} onClick={handleSave}>Сохранить</button>
          </div>
        </div>
      ) : (
        <>
          <h2 className={styles.title}>{trip.title}</h2>

          {(trip.dateFrom || trip.dateTo) && (
            <div className={styles.dates}>
              📅 {trip.dateFrom || '...'} – {trip.dateTo || '...'}
            </div>
          )}

          {trip.description && (
            <p className={styles.description}>{trip.description}</p>
          )}
        </>
      )}

      <div className={styles.photosSection}>
        <h3 className={styles.photosTitle}>Фото:</h3>
        <div className={styles.photos}>
          {(trip.photos || []).map((photoId) => (
            <div key={photoId} className={styles.photoWrap}>
              <img src={getPhotoUrl(tripId, photoId)} alt="" className={styles.photo} />
              <button
                className={styles.removePhoto}
                onClick={() => removePhoto(photoId)}
              >
                ✕
              </button>
            </div>
          ))}
          <label className={styles.addPhoto}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoAdd}
              hidden
              multiple
            />
            <span className={styles.addPhotoIcon}>+</span>
          </label>
        </div>
      </div>
    </div>
  );
}
