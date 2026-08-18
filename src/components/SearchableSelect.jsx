import { useState, useRef, useEffect } from 'react';
import styles from './SearchableSelect.module.css';

export default function SearchableSelect({ options, value, onChange, placeholder, onCreate }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const queryLower = query.toLowerCase();
  const filtered = query
    ? options.filter((o) => (o.searchKey || o.label).toLowerCase().includes(queryLower))
    : options;

  const canCreate = onCreate && query.trim() && !options.some(
    (o) => (o.searchKey || o.label).toLowerCase() === queryLower
  );

  const totalItems = filtered.length + (canCreate ? 1 : 0);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlighted(-1);
  }, [filtered.length, canCreate]);

  useEffect(() => {
    if (open && highlighted >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-index]');
      items[highlighted]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted, open]);

  const handleSelect = (option) => {
    onChange(option.value);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleCreate = () => {
    onCreate(query.trim());
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && highlighted < filtered.length) {
        handleSelect(filtered[highlighted]);
      } else if (highlighted === filtered.length && canCreate) {
        handleCreate();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const showDropdown = open && (filtered.length > 0 || canCreate || query);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        placeholder={selected ? '' : placeholder}
        value={open ? query : (selected ? selected.label : '')}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      <span className={styles.chevron}>{open ? '▲' : '▼'}</span>

      {showDropdown && (
        <div className={styles.dropdown} ref={listRef}>
          {filtered.map((option, i) => (
            <div
              key={option.value}
              data-index={i}
              className={`${styles.option} ${option.value === value ? styles.selected : ''} ${i === highlighted ? styles.highlighted : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(option);
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              {option.label}
            </div>
          ))}
          {canCreate && (
            <div
              data-index={filtered.length}
              className={`${styles.createOption} ${highlighted === filtered.length ? styles.highlighted : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              onMouseEnter={() => setHighlighted(filtered.length)}
            >
              + Создать «{query.trim()}»
            </div>
          )}
          {!canCreate && filtered.length === 0 && (
            <div className={styles.empty}>Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  );
}
