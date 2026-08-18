import { useAuth } from '../context/AuthContext';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h2 className={styles.heading}>⚙️ Настройки</h2>

      <div className={styles.section}>
        <h3>Аккаунт</h3>
        <div className={styles.userInfo}>
          <p><strong>Пользователь:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Данные</h3>
        <p className={styles.info}>
          Все данные хранятся на сервере и привязаны к вашему аккаунту.
          Отметки посещения и воспоминания видны только вам.
        </p>
      </div>

      <div className={styles.section}>
        <h3>Опасно</h3>
        <button className={styles.dangerBtn} onClick={logout}>
          🚪 Выйти из аккаунта
        </button>
      </div>

      <div className={styles.about}>
        <p>Дневник путешествий v2.0</p>
        <p>Данные хранятся на сервере в MongoDB.</p>
      </div>
    </div>
  );
}
