import React, { useState, useEffect } from 'react';
import './Landing.css';

interface LandingProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'welcome' | 'catalog'>('welcome');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error('Hiba a könyvek betöltésekor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }
    setLoading(true);
    setActiveTab('catalog');
    try {
      const res = await fetch(`/api/user/books/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error('Hiba a keresésnél:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <nav className="top-nav">
        <div className="nav-left">
          <span className="logo" onClick={() => setActiveTab('welcome')}>BiblioTár</span>
        </div>
        <div className="nav-center">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Keresés könyvek között..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>Keresés</button>
          </div>
        </div>
        <div className="nav-right">
          <button className="nav-btn login-btn" onClick={onNavigateToLogin}>Bejelentkezés</button>
          <button className="nav-btn register-btn" onClick={onNavigateToRegister}>Regisztráció</button>
        </div>
      </nav>

      <nav className="secondary-nav">
        <span
          className={`sec-nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('catalog');
            setSearchQuery('');
            fetchBooks();
          }}
        >
          Könyvkatalógus
        </span>
      </nav>

      <div className="landing-content-wrapper">
        {activeTab === 'welcome' ? (
          <div className="landing-content">
            <h1 className="landing-title">
              Üdvözöl a <span className="highlight">BiblioTár</span>
            </h1>
            <p className="landing-subtitle">
              Könyv kölcsönzése a bejelentkezés után lehetséges
            </p>
            <button
              className="nav-btn register-btn"
              style={{ fontSize: '1.1rem', padding: '12px 40px' }}
              onClick={() => setActiveTab('catalog')}
            >
              Böngészés a katalógusban
            </button>
          </div>
        ) : (
          <div className="catalog-container" style={{ width: '100%', maxWidth: '1200px', padding: '20px' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Könyvkatalógus</h2>
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Könyvek betöltése...</p>
            ) : books.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nincs elérhető könyv.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
                {books.map((book) => (
                  <div key={book.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ height: '220px', backgroundColor: 'rgba(168, 85, 247, 0.08)', borderRadius: '10px', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'var(--primary-color)', opacity: 0.6, fontSize: '2.5rem', fontWeight: 700 }}>📖</span>
                    </div>
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.3rem', fontWeight: 600 }}>{book.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', flex: 1 }}>{book.author}</p>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '10px',
                      marginBottom: '1rem',
                      display: 'inline-block',
                      alignSelf: 'flex-start',
                      background: book.available ? 'rgba(34, 197, 94, 0.15)' : (book.status === 'reserved' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                      color: book.available ? '#22c55e' : (book.status === 'reserved' ? '#fbbf24' : '#ef4444'),
                    }}>
                      {book.available ? 'Elérhető' : (book.status === 'reserved' ? 'Foglalt' : (book.status === 'borrowed' ? 'Kölcsönözve' : 'Nem elérhető'))}
                    </span>
                    <button
                      className="nav-btn login-btn"
                      style={{ width: '100%', fontSize: '0.9rem', opacity: 0.7 }}
                      onClick={onNavigateToLogin}
                    >
                      Bejelentkezés a kölcsönzéshez
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
