import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import Search from "./Components/search.jsx";
import Spinner from "./Components/spinner.jsx";
import MovieCard from "./Components/movieCard.jsx";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 750, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
      console.log("Fetching from:", endpoint);
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.results && Array.isArray(data.results)) {
        setMovieList(data.results);
      } else {
        setErrorMessage("No movies found or invalid response format");
        setMovieList([]);
      }
    } catch (error) {
      console.error(`Error fetching movies:`, error);
      setErrorMessage("Error fetching movies. Please try again later.");
      setMovieList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendingMovies = async () => {
    try {
      const endpoint = `${API_BASE_URL}/trending/movie/week`;
      console.log("Fetching trending movies from:", endpoint);
      
      const response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trending movies: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Trending API Response:", data);
      
      return data.results || [];
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      return [];
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      
      // Transform the movies to match your expected format
      const formattedMovies = movies.slice(0, 5).map(movie => ({
        $id: movie.id,
        title: movie.title,
        poster_url: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
          : './placeholder.png'
      }));
      
      setTrendingMovies(formattedMovies);
    } catch (error) {
      console.error(`Error loading trending movies:`, error);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span>You'll Enjoy
            without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-600">{errorMessage}</p>
          ) : movieList.length > 0 ? (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          ) : (
            <p>No movies found. Try another search.</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;