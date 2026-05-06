import React, { useState, useEffect } from 'react';
import './Landing.css';

interface UserDashboardProps {
  onLogout: () => void;
  user: any;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'loans' | 'profile'>('catalog');
  const [books, setBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (activeTab === 'loans' && user?.id) {
      fetchLoans();
    }
  }, [activeTab, user?.id]);

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await fetch('/api/user/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error('Hiba a könyvek betöltésekor:', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }
    setLoadingBooks(true);
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
      setLoadingBooks(false);
    }
  };

  const fetchLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await fetch(`/api/user/history/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (err) {
      console.error('Hiba a kölcsönzések betöltésekor:', err);
    } finally {
      setLoadingLoans(false);
    }
  };



  const handleReserve = async (bookId: number) => {
    try {
      const res = await fetch(`/api/user/reserve/${bookId}/${user.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage('Foglalás sikeres!');
        setBooks(prevBooks => prevBooks.map(b => b.id === bookId ? { ...b, available: false, status: 'reserved', reserved_by: user.id } : b));
      } else {
        setMessage(data.message || 'Hiba a foglalásnál.');
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Hiba a foglalásnál.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await fetch(`/api/user/profile/update/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: profilePhone, address: profileAddress }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg('Profil sikeresen frissítve!');
        user.phone = profilePhone;
        user.address = profileAddress;
        localStorage.setItem('user', JSON.stringify(user));
        setEditingProfile(false);
      } else {
        setProfileMsg(data.message || 'Hiba a profil frissítésénél.');
      }
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) {
      setProfileMsg('Hiba a profil frissítésénél.');
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'catalog':
        return (
          <div className="tab-content">
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Könyvkatalógus</h2>
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
            {loadingBooks ? (
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
                  }}
                  >
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
                      {book.available ? 'Elérhető' : (book.status === 'reserved' ? (book.reserved_by === user.id ? 'Foglalt' : 'Foglalt (Saját)') : (book.status === 'borrowed' ? 'Kölcsönözve' : 'Nem elérhető'))}
                    </span>
                    <button style={{
                      width: '100%',
                      padding: '10px',
                      background: 'transparent',
                      border: '1px solid rgba(168, 85, 247, 0.5)',
                      color: 'var(--primary-color)',
                      borderRadius: '20px',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      opacity: book.available ? 1 : 0.5,

                    }}
                      disabled={!book.available}
                      onClick={() => book.available && handleReserve(book.id)}>
                      Foglalás
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'loans':
        const activeBorrows = loans.filter(l => l.status === 'active' || l.status === 'pastdue' || l.status === 'reserved');
        const historyBorrows = loans.filter(l => l.status === 'finished');

        const getDeadlineStyle = (dueDateStr: string | null) => {
          if (!dueDateStr) return {};
          const dueDate = new Date(dueDateStr);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const due = new Date(dueDate);
          due.setHours(0, 0, 0, 0);

          const diffTime = due.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) return { color: '#ef4444', fontWeight: 600 };
          if (diffDays <= 3) return { color: '#f97316', fontWeight: 600 };
          return { color: 'var(--text-main)' };
        };

        return (
          <div className="tab-content">
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Aktuális kölcsönzések</h2>
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
            {loadingLoans ? (
              <p style={{ color: 'var(--text-muted)' }}>Kölcsönzések betöltése...</p>
            ) : activeBorrows.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Nincs aktív kölcsönzésed.</p>
            ) : (
              <div style={{ marginBottom: '4rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '15px 10px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>KÖNYV CÍME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBorrows.map((loan) => (
                      <tr key={loan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '20px 10px', fontWeight: 500 }}>
                          <div>
                            {loan.book}
                            {(loan.status === 'active' || loan.status === 'pastdue') && loan.dueDate && (
                              <span style={{ marginLeft: '1rem', fontSize: '0.85rem', ...getDeadlineStyle(loan.dueDate) }}>
                                (Határidő: {loan.dueDate})
                              </span>
                            )}
                            {loan.status === 'reserved' && (
                              <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#fbbf24' }}>
                                (Feldolgozás alatt)
                              </span>
                            )}
                            {loan.fine > 0 && (
                              <span style={{
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 600
                              }}>
                                Bírság: {loan.fine} Ft
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.5rem' }}>Előzmények</h2>
            {historyBorrows.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nincs korábbi kölcsönzésed.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {historyBorrows.map((loan) => (
                  <div key={loan.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1.2rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', flex: 2 }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{loan.book}</span>
                    </div>
                    <div style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Visszahozva: {loan.returnDate || '-'}
                    </div>
                    <div style={{ flex: 1, textAlign: 'right', color: loan.fine > 0 ? '#ef4444' : '#22c55e', fontWeight: 600, fontSize: '0.9rem' }}>
                      {loan.fine > 0 ? `Bírság: ${loan.fine} Ft` : 'Rendben'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'profile':
        return (
          <div className="tab-content">
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Profilom</h2>
            {profileMsg && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: 'var(--primary-color)',
                padding: '12px 20px',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                fontWeight: 500,
              }}>{profileMsg}</div>
            )}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              padding: '2.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              maxWidth: '650px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), #6b21a8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  color: 'white',
                  fontWeight: 'bold',
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.8rem', marginBottom: '0.4rem', fontWeight: 600 }}>{user?.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px', display: 'inline-block' }}>
                    {user?.roles?.map((r: any) => r.name).join(', ') || 'Olvasó'}
                  </p>
                </div>
              </div>
              {editingProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>E-mail cím</p>
                    <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{user?.email}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telefonszám</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lakcím</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={handleProfileUpdate} style={{
                      padding: '12px 24px',
                      background: 'var(--primary-color)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '25px',
                      fontWeight: 600,
                    }}>
                      Mentés
                    </button>
                    <button onClick={() => { setEditingProfile(false); setProfilePhone(user?.phone || ''); setProfileAddress(user?.address || ''); }} style={{
                      padding: '12px 24px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-muted)',
                      borderRadius: '25px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}>
                      Mégse
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>E-mail cím</p>
                      <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{user?.email}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telefonszám</p>
                      <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{user?.phone}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lakcím</p>
                      <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>{user?.address}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '3rem' }}>
                    <button onClick={() => setEditingProfile(true)} style={{
                      padding: '12px 24px',
                      background: 'var(--primary-color)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '25px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}>
                      Profil szerkesztése
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="landing-page">
      <nav className="top-nav">
        <div className="nav-left">
          <span className="logo">BiblioTár</span>
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
          className={`sec-nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('catalog');
            setSearchQuery('');
            fetchBooks();
          }}
        >
          Könyvkatalógus
        </span>
        <span
          className={`sec-nav-item ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          Kölcsönzéseim
        </span>
        <span
          className={`sec-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profil
        </span>
      </nav>

      <div style={{ flex: 1, padding: '50px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;
