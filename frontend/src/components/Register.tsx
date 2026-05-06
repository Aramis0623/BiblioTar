import React, { useState } from 'react';
import './Login.css';
import './Landing.css';

interface RegisterProps {
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigateToLogin, onNavigateToLanding }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone, address }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        console.log('Sikeres regisztráció:', data);
        setTimeout(() => {
          onNavigateToLogin();
        }, 2000);
      } else {
        throw new Error(data.message || 'Hiba történt a regisztráció során. Lehet, hogy ez az e-mail már foglalt.');
      }
    } catch (err: any) {
      setError(err.message || 'Ismeretlen hiba történt.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <nav className="top-nav">
        <div className="nav-left">
          <span className="logo" onClick={onNavigateToLanding}>BiblioTár</span>
        </div>
        <div className="nav-right">
          <button className="nav-btn login-btn" onClick={onNavigateToLogin}>Bejelentkezés</button>
        </div>
      </nav>
      
      <nav className="secondary-nav">
        <span className="sec-nav-item" onClick={onNavigateToLanding}>Könyvkatalógus</span>
      </nav>

      <div className="landing-content-wrapper">
        <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Regisztráció</h2>
          <p>Hozd létre az új fiókodat</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Teljes név</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Kovács Anna"
              disabled={isLoading || isSuccess}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail cím</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="pelda@email.com"
              disabled={isLoading || isSuccess}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={isLoading || isSuccess}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefonszám</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+36301234567"
              disabled={isLoading || isSuccess}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Lakcím</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Budapest, Fő utca 1."
              disabled={isLoading || isSuccess}
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary ${isSuccess ? 'btn-success' : ''}`}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? 'Regisztráció folyamatban...' : isSuccess ? 'Sikeres!' : 'Regisztráció'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Már van fiókod? <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}>Bejelentkezés</a></p>
          <div className="back-btn-container">
            <button className="back-btn" onClick={onNavigateToLanding}>&larr; Vissza a főoldalra</button>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div >
  );
};

export default Register;
