import React, { useState, useEffect } from 'react';
import './Landing.css';

interface AdminDashboardProps {
  onLogout: () => void;
  user: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState<'books' | 'addBook'>('books');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newYear, setNewYear] = useState('');

  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/books');
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
      const res = await fetch(`/api/admin/books/search?query=${encodeURIComponent(searchQuery)}`);
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



  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          author: newAuthor,
          publishingYear: parseInt(newYear),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Könyv sikeresen hozzáadva!');
        setNewTitle('');
        setNewAuthor('');
        setNewYear('');
        fetchBooks();
        setActiveTab('books');
      } else {
        setMessage(data.message || 'Hiba a könyv hozzáadásánál.');
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Hiba a könyv hozzáadásánál.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    try {
      const res = await fetch(`/api/admin/books/${bookId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMessage('Könyv sikeresen törölve!');
        fetchBooks();
      } else {
        setMessage(data.message || 'Hiba a törlésénél.');
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Hiba a törlésénél.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const startEdit = (book: any) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditYear(book.publishingYear?.toString() || '');
    setEditStatus(book.status || '');
    setEditAvailable(book.available);
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;
    try {
      const parsedYear = parseInt(editYear);
      const body = {
        title: editTitle,
        author: editAuthor,
        status: editStatus,
        available: editAvailable,
        ...(isNaN(parsedYear) ? {} : { publishingYear: parsedYear })
      };

      const res = await fetch(`/api/admin/books/${editingBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data: any = {};
      const text = await res.text();
      try {
        if (text) data = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', text);
      }

      if (res.ok) {
        setMessage('Könyv sikeresen frissítve!');
        setEditingBook(null);
        fetchBooks();
      } else {
        setMessage(data.message || 'Hiba a frissítésnél.');
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Hiba a frissítésnél.');
      setTimeout(() => setMessage(null), 3000);
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
          <span className="logo">BiblioTár Admin</span>
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
          className={`sec-nav-item ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('books');
            setSearchQuery('');
            fetchBooks();
          }}
        >
          Könyvek Kezelése
        </span>
        <span
          className={`sec-nav-item ${activeTab === 'addBook' ? 'active' : ''}`}
          onClick={() => setActiveTab('addBook')}
        >
          Új Könyv Hozzáadása
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

        {activeTab === 'books' && (
          <div style={{}}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Könyvek Kezelése</h2>

            {editingBook && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                marginBottom: '2rem',
              }}>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontWeight: 600 }}>Könyv szerkesztése</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <p style={labelStyle}>Cím</p>
                    <input style={inputStyle} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div>
                    <p style={labelStyle}>Szerző</p>
                    <input style={inputStyle} value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
                  </div>
                  <div>
                    <p style={labelStyle}>Kiadási év</p>
                    <input style={inputStyle} type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} />
                  </div>
                  <div>
                    <p style={labelStyle}>Állapot</p>
                    <input style={inputStyle} value={editStatus} onChange={(e) => setEditStatus(e.target.value)} />
                  </div>
                  <div>
                    <p style={labelStyle}>Elérhető</p>
                    <select
                      style={{ ...inputStyle }}
                      value={editAvailable ? 'true' : 'false'}
                      onChange={(e) => setEditAvailable(e.target.value === 'true')}
                    >
                      <option value="true">Igen</option>
                      <option value="false">Nem</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={handleUpdateBook} style={{
                    padding: '10px 24px',
                    background: 'var(--primary-color)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '25px',
                    fontWeight: 600,
                  }}>
                    Mentés
                  </button>
                  <button onClick={() => setEditingBook(null)} style={{
                    padding: '10px 24px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-muted)',
                    borderRadius: '25px',
                    fontWeight: 600,
                  }}>
                    Mégse
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Könyvek betöltése...</p>
            ) : books.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nincs könyv az adatbázisban.</p>
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
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{book.author}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: book.available
                          ? 'rgba(34, 197, 94, 0.15)'
                          : (book.status === 'reserved'
                            ? 'rgba(251, 191, 36, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)'),
                        color: book.available
                          ? '#22c55e'
                          : (book.status === 'reserved' ? '#fbbf24' : '#ef4444'),
                      }}>
                        {book.available ? 'Elérhető' : (book.status === 'reserved' ? 'Lefoglalva' : 'Nem elérhető')}
                      </span>

                      <button onClick={() => startEdit(book)} style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid rgba(168, 85, 247, 0.5)',
                        color: 'var(--primary-color)',
                        borderRadius: '20px',
                        fontWeight: 500,
                        fontSize: '0.85rem'
                      }}>
                        Szerkesztés
                      </button>
                      <button onClick={() => handleDeleteBook(book.id)} style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#ef4444',
                        borderRadius: '20px',
                        fontWeight: 500,
                        fontSize: '0.85rem'
                      }}>
                        Törlés
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addBook' && (
          <div style={{}}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '2rem', fontWeight: 600, fontSize: '1.8rem' }}>Új Könyv Hozzáadása</h2>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              padding: '2.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              maxWidth: '600px',
            }}>
              <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <p style={labelStyle}>Cím</p>
                  <input
                    style={inputStyle}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="Könyv címe"
                  />
                </div>
                <div>
                  <p style={labelStyle}>Szerző</p>
                  <input
                    style={inputStyle}
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    required
                    placeholder="Szerző neve"
                  />
                </div>
                <div>
                  <p style={labelStyle}>Kiadási év</p>
                  <input
                    style={inputStyle}
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    required
                    placeholder="pl. 2024"
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
                  Hozzáadás
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
