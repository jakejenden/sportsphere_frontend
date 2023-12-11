// MovieSearchPage.tsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';

interface MovieResult {
  Adult: string,
  Budget: string,
  Genres: string,
  Language: string,
  Title: string,
  Overview: string,
  PopularityScore: string,
  ProductionCompanies: string,
  ProductionCountries: string,
  ReleaseDate: string,
  Revenue: number,
  RunTime: number,
  SpokenLanguages: string,
  VoteAverageScore: number,
  VoteCount: number
}

const MovieSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [movieResults, setMovieResults] = useState<MovieResult[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the token from localStorage on component mount
    const storedToken = localStorage.getItem('token');
    console.log('Stored Token:', storedToken);
    setToken(storedToken);
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSearch = async () => {
    try {
      document.cookie = `token=${token}; path=/`;

      const response = await axios.get(`http://localhost:3030/returnresults?title=${searchTerm}`, {
        withCredentials: true,
      });
      const fetchedResults: MovieResult[] = response.data;

      setMovieResults(fetchedResults);
    } catch (error) {
      console.error('Error fetching movie data:', error);
      // Handle error, e.g., display an error message
    }
  };

  return (
    <div className="container mt-5">
      <h2>Movie Search</h2>

      <Form>
        <Form.Group controlId="searchTerm" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Enter movie title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleSearch}>
          Search
        </Button>
      </Form>

      {movieResults && movieResults.length > 0 && (
        <Table className="mt-3" striped bordered hover>
          <thead>
            <tr>
              <th>Release Date</th>
              <th>Adult Rating</th>
              <th>Budget</th>
              <th>Genre</th>
              <th>Language</th>
              <th>Popularity</th>
              <th>Revenue</th>
              <th>Length</th>
              <th>Average Vote</th>
              <th>Vote Count</th>
            </tr>
          </thead>
          <tbody>
            {movieResults.map((result, index) => (
              <tr key={index}>
                <td>{result.ReleaseDate}</td>
                <td>{result.Adult}</td>
                <td>{result.Budget}</td>
                <td>{result.Genres}</td>
                <td>{result.Language}</td>
                <td>{result.PopularityScore}</td>
                <td>{result.Revenue}</td>
                <td>{result.RunTime}</td>
                <td>{result.VoteAverageScore}</td>
                <td>{result.VoteCount}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MovieSearchPage;
