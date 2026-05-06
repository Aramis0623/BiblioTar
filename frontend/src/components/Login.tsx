import React, { useState } from 'react';
import './Login.css';
import './Landing.css';

interface LoginProps {
  onNavigateToRegister: () => void;
  onNavigateToLanding: () => void;
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToRegister, onNavigateToLanding, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        console.log('Sikeres bejelentkezés:', data);
        localStorage.setItem('user', JSON.stringify(data));

        onLoginSuccess(data);
      } else {
        throw new Error(data.message || 'Sikertelen bejelentkezés. Ellenőrizd az adataidat.');
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
          <button className="nav-btn register-btn" onClick={onNavigateToRegister}>Regisztráció</button>
        </div>
      </nav>
      
      <nav className="secondary-nav">
        <span className="sec-nav-item" onClick={onNavigateToLanding}>Könyvkatalógus</span>
      </nav>

      <div className="landing-content-wrapper">
        <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Bejelentkezés</h2>
          <p>Jelentkezz be a fiókodba</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
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
          
          <button 
            type="submit" 
            className={`btn-primary ${isSuccess ? 'btn-success' : ''}`}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? 'Bejelentkezés...' : isSuccess ? 'Sikeres!' : 'Bejelentkezés'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Még nincs fiókod? <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRegister(); }}>Regisztráció</a></p>
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

export default Login;
