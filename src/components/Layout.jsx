import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>🌍 Дневник путешествий</h1>
        <div className={styles.userBlock}>
          <span className={styles.userName}>{user?.username}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <nav className={styles.nav}>
        <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>
          🌍 Каталог
        </NavLink>
        <NavLink to="/travels" className={({ isActive }) => isActive ? styles.active : ''}>
          📚 Путешествия
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => isActive ? styles.active : ''}>
          🗺️ Карта
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? styles.active : ''}>
          ⚙️
        </NavLink>
      </nav>
    </div>
  );
}