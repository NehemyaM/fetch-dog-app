import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Typography, Button, Paper } from '@mui/material';
import { Player } from '@lottiefiles/react-lottie-player';
import styles from './LoginPage.module.css';
import animationData from '../assets/bg-animation.json'; // your downloaded Lottie file
import dogWalkAnimation from '../assets/dog1.json'; // adjust the path as needed


export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await api.post('/auth/login', { name, email });
      navigate('/search');
    } catch (err) {
      alert('Login failed. Please check your inputs.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.gradientBackground}></div>

      <Player
        autoplay
        loop
        src={animationData}
        className={styles.lottieBackground}
      />

      <div className={styles.container}>
        <Paper className={styles.paper}>
          <Typography variant="h4" gutterBottom>
            Fetch Dog Finder
          </Typography>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={handleLogin}
          >
            Log In
          </Button>
        </Paper>
      </div>
    </div>
  );
}
