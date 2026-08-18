import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, placeholder = 'Поиск...' }) {
  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className={styles.clear} onClick={() => onChange('')}>
          ✕
        </button>
      )}
    </div>
  );
}