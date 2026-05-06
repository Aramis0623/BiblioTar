import React, { useState, useEffect } from 'react';
import './Landing.css';

interface LibrarianDashboardProps {
  onLogout: () => void;
  user: any;
}

const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState<'borrows' | 'newBorrow' | 'books'>('borrows');
  const [borrows, setBorrows] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [borrowUserId, setBorrowUserId] = useState('');
  const [borrowBookId, setBorrowBookId] = useState('');
  const [borrowDays, setBorrowDays] = useState('14');

  const [returnFine, setReturnFine] = useState('0');
  const [extendDays, setExtendDays] = useState('7');

  useEffect(() => {
    fetchBorrows();
    fetchBooks();
  }, []);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/librarian/borrows');
      if (res.ok) {
        const data = await res.json();
        setBorrows(data);
      }
    } catch (err) {
      console.error('Hiba a kölcsönzések betöltésekor:', err);
    } finally {
      setLoading(false);
    }
  };

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
    setLoading(true);
    setActiveTab('books');
    try {
      const res = await fetch(`/api/librarian/books/search?query=${encodeURIComponent(searchQuery)}`);
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



  const handleCreateBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/librarian/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(borrowUserId),
          book_id: parseInt(borrowBookId),
          daysBorrowed: parseInt(borrowDays),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Kölcsönzés sikeresen létrehozva!');
        setBorrowUserId('');
        setBorrowBookId('');
        setBorrowDays('14');
        fetchBorrows();
        setActiveTab('borrows');
      } else {
        setMessage(data.message || 'Hiba a kölcsönzés létrehozásánál.');
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Hiba a kölcsönzés létrehozásánál.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReturn = async (borrowId: number) => {
    try {
      const res = await fetch(`/api/librarian/borrow/${borrowId}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fine: parseInt(returnFine) || 0 }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Könyv sikeresen visszavéve!');
        fetchBorrows();
      } else {
        setMessage(data.message || 'Hiba a visszavételnél.');
      }
      setReturnFine('0');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Hiba a visszavételnél.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExtend = async (borrowId: number) => {
    try {
      const res = await fetch(`/api/librarian/borrow/${borrowId}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: parseInt(extendDays) || 7 }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Kölcsönzés sikeresen meghosszabbítva!');
        fetchBorrows();
      } else {
        setMessage(data.message || 'Hiba a hosszabbításnál.');
      }
      setExtendDays('7');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Hiba a hosszabbításnál.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleFine = async (borrowId: number, amount: number) => {
    try {
      const res = await fetch(`/api/librarian/borrow/${borrowId}/fine`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fine: amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Bírság sikeresen hozzáadva!');
        fetchBorrows();
      } else {
        setMessage(data.message || 'Hiba a bírság hozzáadásánál.');
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Hiba a bírság hozzáadásánál.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktív';
      case 'pastdue': return 'Lejárt';
      case 'finished': return 'Befejezett';
      case 'reserved': return 'Foglalt';
      case 'borrowed': return 'Kölcsönözve';
      case 'available': return 'Elérhető';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'rgba(168, 85, 247, 0.15)', color: 'var(--primary-color)' };
      case 'pastdue': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      case 'finished': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' };
      case 'reserved': return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' };
      default: return { bg: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' };
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.3rem',
  };

  return (
    <div className="landing-page">
      <nav className="top-nav">
        <div className="nav-left">
          <span className="logo">BiblioTár Könyvtáros</span>
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
          <span style={{ color: 'var(--text-main)', marginRight: '1rem', fontWeight: 500 }}>{user?.name}</span>
          <button className="nav-btn register-btn" onClick={onLogout}>Kijelentkezés</button>
        </div>
      </nav>

      <nav className="secondary-nav">
        <span
          className={`sec-nav-item ${activeTab === 'borrows' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrows')}
        >
          Kölcsönzések
        </span>
        <span
          className={`sec-nav-item ${activeTab === 'newBorrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('newBorrow')}
        >
          Új Kölcsönzés
        </span>
        <span
          className={`sec-nav-item ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('books');
            setSearchQuery('');
            fetchBooks();
          }}
        >
          Könyvek
        </span>
      </nav>

      <div style={{ flex: 1, padding: '50px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {message && (
          <div style={{
            background: 'rgba(168, 85, 247, 0.15)',
            color: 'var(--primary-color)',
            padding: '12px 20px',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}>{message}</div>
        )}

        {activeTab === 'borrows' && (
          <div>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Kölcsönzések Kezelése</h2>
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Kölcsönzések betöltése...</p>
            ) : borrows.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nincs kölcsönzés az adatbázisban.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {borrows.map((borrow) => {
                  const statusStyle = getStatusColor(borrow.status);
                  return (
                    <div key={borrow.id} style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      padding: '1.5rem',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                      }}>
                        <div>
                          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>{borrow.book_title}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Olvasó: {borrow.user_name}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Határidő: {borrow.dueDate || 'Nincs megadva'}
                          </span>
                          <span style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}>
                            {getStatusLabel(borrow.status)}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gap: '1rem',
                        padding: '1.5rem 0',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        borderBottom: borrow.status !== 'finished' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        marginBottom: '1.5rem'
                      }}>
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Kölcsönzés dátuma</p>
                          <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>{borrow.dateBorrowed || '-'}</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Kölcsönzési napok</p>
                          <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>{borrow.daysBorrowed}</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Hosszabbítások</p>
                          <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>{borrow.extend_count}/2</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Bírság</p>
                          <p style={{ color: borrow.fine > 0 ? '#ef4444' : 'var(--text-main)', fontWeight: 600 }}>{borrow.fine || 0} Ft</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        {borrow.status !== 'finished' && borrow.status !== 'reserved' && (
                          <>
                            <button onClick={() => handleReturn(borrow.id)} style={{
                              padding: '8px 16px',
                              background: 'rgba(34, 197, 94, 0.15)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              color: '#22c55e',
                              borderRadius: '20px',
                              fontWeight: 500,
                              fontSize: '0.85rem',
                            }}>
                              Visszavétel
                            </button>
                            {borrow.status === 'active' && (
                              <button onClick={() => handleExtend(borrow.id)} style={{
                                padding: '8px 16px',
                                background: 'rgba(168, 85, 247, 0.15)',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                color: 'var(--primary-color)',
                                borderRadius: '20px',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                              }}>
                                Hosszabbítás (+{extendDays} nap)
                              </button>
                            )}
                            <button onClick={() => {
                              const amount = prompt('Bírság összege:');
                              if (amount) handleFine(borrow.id, parseInt(amount) || 0);
                            }} style={{
                              padding: '8px 16px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              borderRadius: '20px',
                              fontWeight: 500,
                              fontSize: '0.85rem',
                            }}>
                              Bírság
                            </button>
                          </>
                        )}
                        {borrow.status === 'reserved' && (
                          <button onClick={() => {
                            setBorrowUserId(borrow.user_id.toString());
                            setBorrowBookId(borrow.book_id.toString());
                            setActiveTab('newBorrow');
                          }} style={{
                            padding: '8px 16px',
                            background: 'var(--primary-color)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '20px',
                            fontWeight: 500,
                            fontSize: '0.85rem',
                          }}>
                            Kölcsönzés elindítása
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'newBorrow' && (
          <div style={{}}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Új Kölcsönzés Létrehozása</h2>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              padding: '2.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              maxWidth: '600px',
            }}>
              <form onSubmit={handleCreateBorrow} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <p style={labelStyle}>Felhasználó ID</p>
                  <input
                    style={inputStyle}
                    type="number"
                    value={borrowUserId}
                    onChange={(e) => setBorrowUserId(e.target.value)}
                    required
                    placeholder="Felhasználó azonosítója"
                  />
                </div>
                <div>
                  <p style={labelStyle}>Könyv ID</p>
                  <input
                    style={inputStyle}
                    type="number"
                    value={borrowBookId}
                    onChange={(e) => setBorrowBookId(e.target.value)}
                    required
                    placeholder="Könyv azonosítója"
                  />
                </div>
                <div>
                  <p style={labelStyle}>Kölcsönzési napok</p>
                  <input
                    style={inputStyle}
                    type="number"
                    value={borrowDays}
                    onChange={(e) => setBorrowDays(e.target.value)}
                    required
                    placeholder="14"
                  />
                </div>
                <button type="submit" style={{
                  padding: '14px 28px',
                  background: 'var(--primary-color)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '25px',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}>
                  Kölcsönzés létrehozása
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'books' && (
          <div style={{}}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Könyvek</h2>
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Könyvek betöltése...</p>
            ) : books.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nincs könyv.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {books.map((book) => (
                  <div key={book.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>{book.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{book.author} • {book.publishingYear}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: book.available ? 'rgba(34, 197, 94, 0.15)' : (book.status === 'reserved' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                        color: book.available ? '#22c55e' : (book.status === 'reserved' ? '#fbbf24' : '#ef4444'),
                      }}>
                        {book.available ? 'Elérhető' : (book.status === 'reserved' ? 'Foglalt' : (book.status === 'borrowed' ? 'Kölcsönözve' : 'Nem elérhető'))}
                      </span>
                    </div>
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

export default LibrarianDashboard;
