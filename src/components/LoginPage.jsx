import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPages.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
        <h2 className={styles.title}>🔑 Вход</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className={styles.switch}>
          Нет аккаунта? <a href="/register" className={styles.link}>Зарегистрируйтесь</a>
        </p>
      </div>
    </div>
  );
}