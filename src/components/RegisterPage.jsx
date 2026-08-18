import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPages.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>✨ Регистрация</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="traveler2025"
              required
              minLength={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Подтвердите пароль</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={styles.input}
              placeholder="Повторите пароль"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className={styles.switch}>
          Уже есть аккаунт? <a href="/login" className={styles.link}>Войти</a>
        </p>
      </div>
    </div>
  );
}