import { useEffect, useState } from 'react';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './SearchPage.module.css';
import {Grid} from '@mui/material';
import { motion } from 'framer-motion';

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export default function SearchPage() {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [nextQuery, setNextQuery] = useState('');
  const [prevQuery, setPrevQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('breed:asc');
  const [favorites, setFavorites] = useState<string[]>([]);

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

  const fetchBreeds = async () => {
    try {
      const response = await api.get('/dogs/breeds');
      setBreeds(response.data);
    } catch (error) {
      console.error('Failed to fetch breeds', error);
    }
  };

  const fetchDogs = async (customQuery = '') => {
    try {
      const baseQuery = selectedBreed ? `breeds=${selectedBreed}` : '';
      const fullQuery = customQuery || `?${baseQuery}&sort=${sortOrder}`;

      const response = await api.get(`/dogs/search${fullQuery}`);
      const dogIds = response.data.resultIds;
      setNextQuery(response.data.next);
      setPrevQuery(response.data.prev);

      if (dogIds.length > 0) {
        const detailsRes = await api.post('/dogs', dogIds);
        setDogs(detailsRes.data);
      } else {
        setDogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch dogs', error);
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, []);

  useEffect(() => {
    fetchDogs();
  }, [selectedBreed, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h4">🐾 Browse Dogs for Adoption</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          🔓 Logout
        </Button>
      </div>

      <div className={styles.filters}>
        <FormControl fullWidth>
          <InputLabel>Select Breed</InputLabel>
          <Select
            value={selectedBreed}
            label="Select Breed"
            onChange={(e) => setSelectedBreed(e.target.value)}
          >
            {breeds.map((breed) => (
              <MenuItem key={breed} value={breed}>
                {breed}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOrder}
            label="Sort By"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="breed:asc">Breed (A-Z)</MenuItem>
            <MenuItem value="breed:desc">Breed (Z-A)</MenuItem>
            <MenuItem value="name:asc">Name (A-Z)</MenuItem>
            <MenuItem value="name:desc">Name (Z-A)</MenuItem>
            <MenuItem value="age:asc">Age (Youngest First)</MenuItem>
            <MenuItem value="age:desc">Age (Oldest First)</MenuItem>
          </Select>
        </FormControl>
      </div>

      <Grid container spacing={3} justifyContent="center">
        {dogs.map((dog, index) => (
          <Grid item xs={12} sm={6} md={4} key={dog.id} {...({} as any)}>
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <img src={dog.img} alt={dog.name} className={styles.image} />
              <Typography variant="h6">{dog.name}</Typography>
              <Typography className={styles.details}>Breed: {dog.breed}</Typography>
              <Typography className={styles.details}>Age: {dog.age}</Typography>
              <Typography className={styles.details}>ZIP: {dog.zip_code}</Typography>
              <Button
                fullWidth
                variant={favorites.includes(dog.id) ? 'contained' : 'outlined'}
                color={favorites.includes(dog.id) ? 'secondary' : 'primary'}
                sx={{ mt: 1 }}
                onClick={() => {
                  setFavorites((prev) =>
                    prev.includes(dog.id)
                      ? prev.filter((id) => id !== dog.id)
                      : [...prev, dog.id]
                  );
                }}
              >
                {favorites.includes(dog.id) ? '💔 Unfavorite' : '❤️ Favorite'}
              </Button>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <div className={styles.pagination}>
        <Button
          variant="outlined"
          onClick={() => fetchDogs(prevQuery)}
          disabled={!prevQuery}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={() => fetchDogs(nextQuery)}
          disabled={!nextQuery}
        >
          Next
        </Button>
      </div>

      {favorites.length > 0 && (
        <div className={styles.matchButton}>
          <Button
            variant="contained"
            color="success"
            onClick={async () => {
              try {
                const res = await api.post('/dogs/match', favorites);
                const matchId = res.data.match;
                localStorage.setItem('matchedDogId', matchId);
                setFavorites([]);
                navigate('/match');
              } catch (error) {
                console.error('Failed to find match', error);
              }
            }}
          >
            🐶 Find My Match
          </Button>
        </div>
      )}

      <footer className={styles.footer}>
        <Typography variant="body2" align="center">
          🐶 Adopt, Don’t Shop — Powered by Fetch Dog App © {new Date().getFullYear()}
        </Typography>
      </footer>
    </div>
  );
}
