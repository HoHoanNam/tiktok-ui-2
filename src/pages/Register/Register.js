import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Login/Auth.module.scss';
import { routes } from '~/config';

const cx = classNames.bind(styles);

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(routes.home);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className={cx('wrapper')}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className={cx('form')}>
        <div className={cx('form-group')}>
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className={cx('form-group')}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className={cx('form-group')}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className={cx('error')}>{error}</p>}
        <button type="submit" className={cx('submit-btn')}>
          Register
        </button>
      </form>
      <p>
        Already have an account? <Link to={routes.login}>Log In</Link>
      </p>
    </div>
  );
}

export default Register;
