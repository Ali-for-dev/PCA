import { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    setError('');
    console.log('Identifiant :', username);
    console.log('Email :', email);
    console.log('Mot de passe :', password);
    alert('Inscription réussie !');
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <h2>Inscription</h2>
        <form onSubmit={handleSignUp} className="auth-form">
          <label>
            Identifiant :
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choisissez un identifiant"
            />
          </label>

          <label>
            Email :
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Entrez votre email"
            />
          </label>

          <label>
            Mot de passe :
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Entrez un mot de passe"
            />
          </label>

          <label>
            Confirmer le mot de passe :
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirmez votre mot de passe"
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit">S'inscrire</button>
        </form>
      </div>
    </div>
  );
}

export default App;
