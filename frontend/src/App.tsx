import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Login from './components/Login'
import Register from './components/Register'
import AdminDashboard from './components/AdminDashboard'
import LibrarianDashboard from './components/LibrarianDashboard'
import UserDashboard from './components/UserDashboard'

type ViewType = 'landing' | 'login' | 'register' | 'admin-dashboard' | 'librarian-dashboard' | 'user-dashboard';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        handleLoginSuccess(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    
    const isAdmin = userData.roles?.some((role: any) => role.name === 'admin');
    const isLibrarian = userData.roles?.some((role: any) => role.name === 'librarian');
    
    if (isAdmin) {
      setCurrentView('admin-dashboard');
    } else if (isLibrarian) {
      setCurrentView('librarian-dashboard');
    } else {
      setCurrentView('user-dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <Landing 
          onNavigateToLogin={() => setCurrentView('login')} 
          onNavigateToRegister={() => setCurrentView('register')} 
        />
      )}
      {currentView === 'login' && (
        <Login 
          onNavigateToRegister={() => setCurrentView('register')} 
          onNavigateToLanding={() => setCurrentView('landing')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentView === 'register' && (
        <Register 
          onNavigateToLogin={() => setCurrentView('login')} 
          onNavigateToLanding={() => setCurrentView('landing')}
        />
      )}
      {currentView === 'admin-dashboard' && (
        <AdminDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'librarian-dashboard' && (
        <LibrarianDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'user-dashboard' && (
        <UserDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}

export default App
