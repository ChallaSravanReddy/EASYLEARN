import styles from '../styles/Header.module.css';

export default function Header({ search, setSearch, handleLogin }) {
  return (
    <header className={styles.header}>
      {/* <div className={styles.logo}>EASY LEARN</div> */}
      {/* <input 
        type="text" 
        placeholder="Search Course..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.search}
      /> */}
      {/* <button onClick={handleLogin} className={styles.login}>Login</button> */}
      {/* <div className={styles.profile}>👤</div> */}
    </header>
  );
}
