import { useEffect, useState } from 'react';
import { Container, Typography, Button } from '@mui/material';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import styles from './MatchPage.module.css';
import confetti from 'canvas-confetti';

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export default function MatchPage() {
  const [match, setMatch] = useState<Dog | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('matchedDogId');
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  useEffect(() => {
    // Confetti celebration on page load
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      angle: 90,
      startVelocity: 45,
    });
  }, []);

  useEffect(() => {
    const matchId = localStorage.getItem('matchedDogId');
    if (!matchId) {
      alert('No match found.');
      navigate('/search');
      return;
    }

    const fetchMatch = async () => {
      try {
        const res = await api.post('/dogs', [matchId]);
        setMatch(res.data[0]);
      } catch (error) {
        console.error('Failed to fetch match', error);
      }
    };

    fetchMatch();
  }, [navigate]);

  if (!match) {
    return (
      <Container>
        <Typography variant="h5" mt={5}>
          Loading your match...
        </Typography>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <div className={styles.titleBar}>
        <Typography variant="h4">🎉 Meet Your Match!</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          🔒 Logout
        </Button>
      </div>

      <div className={styles.card}>
        <img src={match.img} alt={match.name} className={styles.image} />
        <Typography variant="h5" mt={2}>
          {match.name}
        </Typography>
        <Typography className={styles.details}>Breed: {match.breed}</Typography>
        <Typography className={styles.details}>Age: {match.age}</Typography>
        <Typography className={styles.details}>ZIP Code: {match.zip_code}</Typography>
      </div>

      <Button
        variant="contained"
        sx={{ marginTop: 4 }}
        onClick={() => navigate('/search')}
      >
        🔁 Back to Search
      </Button>
    </Container>
  );
}
