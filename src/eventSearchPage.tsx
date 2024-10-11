import React, { useState, useEffect } from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Correct import
import axios, { AxiosResponse } from 'axios';
import { API_URL } from './config';
import './eventSearchPage.css';
import './eventSearchCarousel.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Includes Popper.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS


interface EventResult {
  Id: number,
  Name: string;
  Street: string;
  City: string;
  County: string;
  PostCode: string;
  EventDate: Date;
  EventType: string;
  Distance: string;
  EventOrganiser: string;
  PresignedImageURL: string;
  isFavourited?: boolean;
}

type Favourite = {
  UserId: number;
  EventId: number;
  EventName: string;
};

interface ApiResponse {
  success: boolean;
  message?: string;
}

const EventSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [eventResults, setEventResults] = useState<EventResult[]>([]);
  const [recommendedEventResults, setRecommendedEventResults] = useState<EventResult[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [searchMethod, setSearchMethod] = useState('name');
  const [sortOption, setSortOption] = useState<string>('');
  const [viewMode, setViewMode] = useState('list');
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Calculate the index of the first and last item of the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handleEventRecommendations = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
    }

    let response: AxiosResponse<EventResult[]>;

    try {
      document.cookie = `token=${token}; path=/`;

      response = await axios.get<EventResult[]>(`${API_URL}/getrecommendedevents`, {
        withCredentials: true,
      });

      if (response.data && Array.isArray(response.data)) {
        const fetchedResults: EventResult[] = response.data
          .map((item: any) => ({
            ...item,
            EventDate: new Date(item.EventDate)
          }));

        console.log(fetchedResults);
        setRecommendedEventResults(fetchedResults);
      }
    } catch (error) {
      console.error("Error fetching recommendations", error);
    }
  };

  const handleNext = () => {
    setCurrentCarouselIndex((prevIndex) => (prevIndex + 1) % recommendedEventResults.length);
  };

  const handlePrev = () => {
    setCurrentCarouselIndex((prevIndex) => (prevIndex - 1 + recommendedEventResults.length) % recommendedEventResults.length);
  };

  useEffect(() => {
    // Fetch recommended events only when the component mounts
    if (!searchPerformed) {
      handleEventRecommendations();
    }
  }, [searchPerformed]);


  const sortEventResults = (results: EventResult[]) => {
    switch (sortOption) {
      case 'alphabetical-asc':
        return results.sort((a, b) => a.Name.localeCompare(b.Name));
      case 'alphabetical-desc':
        return results.sort((a, b) => b.Name.localeCompare(a.Name));
      case 'date-desc':
        return results.sort((a, b) => new Date(b.EventDate).getTime() - new Date(a.EventDate).getTime());
      default:
        return results;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);

      if (!storedToken) {
        navigate('/login'); // Redirect to login if not authenticated
      } else {
        setLoading(false); // Token exists, update loading state
      }
    };

    checkToken();
  }, [navigate]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      document.cookie = `token=${token}; path=/`;

      let response: AxiosResponse<EventResult[]>;

      if (searchMethod === 'name') {
        response = await axios.get<EventResult[]>(`${API_URL}/getresultsbyeventname?eventName=${searchTerm}`, {
          withCredentials: true,
        });
      } else if (searchMethod === 'location') {
        response = await axios.get<EventResult[]>(`${API_URL}/getresultsbyeventcity?city=${searchTerm}`, {
          withCredentials: true,
        });
      } else {
        response = await axios.get<EventResult[]>(`${API_URL}/getresultsbyeventorg?eventOrg=${searchTerm}`, {
          withCredentials: true,
        });
      }

      await updateFavourites();

      if (response.data && Array.isArray(response.data)) {
        const fetchedResults: EventResult[] = response.data
          .map((item: any) => ({
            ...item,
            EventDate: new Date(item.EventDate),
            isFavourited: isFavourite(item.Id) // Initialize isFavourited
          }));

        const sortedResults = sortEventResults(fetchedResults);
        setEventResults(sortedResults);
      } else {
        setEventResults([]);
      }

      setSearchPerformed(true);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const currentItems = eventResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(eventResults.length / itemsPerPage);

  useEffect(() => {
    if (eventResults.length > 0) {
      const sortedResults = sortEventResults([...eventResults]);
      setEventResults(sortedResults);
    }
  }, [sortOption]);

  const handleListView = () => {
    setViewMode('list');
  };

  const handleGridView = () => {
    setViewMode('grid');
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/logout`, {
        withCredentials: true,
      });

      localStorage.removeItem('token');

      navigate('/login'); // Use navigate to redirect after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleRedirectToProfile = () => {
    navigate('/account-details')
  }

  const handleRedirect = (eventId: number) => {
    navigate(`/event/${eventId}`);
  };

  const fetchFavourites = async () => {
    try {
      const response = await axios.get<Favourite[]>(`${API_URL}/getfavourites`, {
        withCredentials: true,
      });
      setFavourites(response.data);
      return response.data
    } catch (error) {
      console.error("Error fetching favourites:", error);
      return [];
    }
  };

  const updateFavourites = async () => {
    try {
      const favData = await fetchFavourites();
      setFavourites(favData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  useEffect(() => {
    // Fetch favorites when the component mounts
    const fetchInitialFavorites = async () => {
      try {
        const favData = await fetchFavourites();
        setFavourites(favData);
      } catch (error) {
        console.error('Error fetching initial favorites:', error);
      }
    };

    fetchInitialFavorites();
  }, []);

  useEffect(() => {
    // Function to update favorites based on the current search results
    const updateFavorites = async () => {
      const favData = await fetchFavourites();
      setFavourites(favData);
    };

    // Call updateFavorites whenever search results change
    if (eventResults.length > 0) {
      updateFavorites();
    }
  }, [eventResults]);

  const isFavourite = (eventId: number): boolean => {
    if (!favourites) {
      return false;
    }
    console.log("isFavourite favourites: ", favourites)
    console.log("isFavourite eventId: ", eventId)
    return favourites.some(favourite => favourite.EventId === eventId);
  };

  const handleStarClick = async (id: number, eventName: string, event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault(); // Prevent default anchor behavior

    const isFavourited = eventResults.find(event => event.Id === id)?.isFavourited;
    const payload = { EventId: id, EventName: eventName };

    try {
      if (isFavourited) {
        // Delete favourite
        const response = await axios.delete<ApiResponse>(`${API_URL}/deletefavourite`, {
          data: payload,
          withCredentials: true,
        });
        if (response.data.success) {
          // Fetch the updated favourites list
          const updatedFavourites = await axios.get<Favourite[]>(`${API_URL}/getfavourites`, {
            withCredentials: true,
          });
          setFavourites(updatedFavourites.data);
        }
      } else {
        // Add favourite
        const response = await axios.post<ApiResponse>(`${API_URL}/addfavourite`, payload, {
          withCredentials: true,
        });
        if (response.data.success) {
          // Fetch the updated favourites list
          const updatedFavourites = await axios.get<Favourite[]>(`${API_URL}/getfavourites`, {
            withCredentials: true,
          });
          setFavourites(updatedFavourites.data);
        }
      }
      // Update the eventResults to reflect the new isFavourited state
      setEventResults(prevResults =>
        prevResults.map(event =>
          event.Id === id ? { ...event, isFavourited: !isFavourited } : event
        )
      );
    } catch (error) {
      console.error('Error handling star click:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="header-container">
        <div className="logout-container">
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
              Settings
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li><a className="dropdown-item" href="#" onClick={handleRedirectToProfile}>Profile</a></li>
              <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12 card-margin">
          <div className="card search-form">
            <div className="card-body p-0">
              <Form id="search-form" onSubmit={handleSearch}>
                <div className="row">
                  <div className="col-12">
                    <div className="row no-gutters">
                      <div className="col-lg-3 col-md-3 col-sm-12 p-0">
                        <Form.Control
                          as="select"
                          className="form-control"
                          id="searchMethod"
                          value={searchMethod}
                          onChange={(e) => setSearchMethod(e.target.value)}
                        >
                          <option value="name">Event Name</option>
                          <option value="location">Location</option>
                          <option value="organiser">Organiser</option>
                        </Form.Control>
                      </div>
                      <div className="col-lg-8 col-md-6 col-sm-12 p-0">
                        <Form.Control
                          type="text"
                          placeholder="Search..."
                          className="form-control"
                          id="search"
                          name="search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="col-lg-1 col-md-3 col-sm-12 p-0">
                        <Button type="submit" className="btn btn-base">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {searchPerformed ? (
        <div className="row">
          <div className="col-12">
            <div className="card card-margin">
              <div className="card-body">
                <div className="row search-body">
                  <div className="col-lg-12">
                    <div className="search-result">
                      <div className="result-header">
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="records">Showing: <b>{indexOfFirstItem + 1}-{indexOfLastItem}</b> of <b>{eventResults.length}</b> result</div>
                          </div>
                          <div className="col-lg-6">
                            <div className="result-actions">
                              <div className="result-sorting">
                                <span>Sort By:</span>
                                <select className="form-control border-0" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                  <option value="date-desc">Date</option>
                                  <option value="alphabetical-asc">Names (A-Z)</option>
                                  <option value="alphabetical-desc">Names (Z-A)</option>
                                </select>
                              </div>
                              <div className="result-views">
                                <button type="button" className="btn btn-soft-base btn-icon" onClick={handleListView}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="feather feather-list"
                                  >
                                    <line x1="8" y1="6" x2="21" y2="6"></line>
                                    <line x1="8" y1="12" x2="21" y2="12"></line>
                                    <line x1="8" y1="18" x2="21" y2="18"></line>
                                    <line x1="3" y1="6" x2="3" y2="6"></line>
                                    <line x1="3" y1="12" x2="3" y2="12"></line>
                                    <line x1="3" y1="18" x2="3" y2="18"></line>
                                  </svg>
                                </button>
                                <button type="button" className="btn btn-soft-base btn-icon" onClick={handleGridView}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="feather feather-grid"
                                  >
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="result-body">
                        {viewMode === 'list' ? (
                          // List (Table) View
                          <div className="table-responsive">
                            <table className="table widget-26">
                              <tbody>
                                {currentItems.length > 0 &&
                                  currentItems.map((result, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div className="widget-26-job-title">
                                          <button onClick={() => handleRedirect(result.Id)}>{result.Name}</button>
                                          <p className="m-0">{result.EventDate.toLocaleDateString()}</p>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="widget-26-job-info">
                                          <p className="type m-0">{result.City}</p>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="widget-26-job-salary">{result.EventOrganiser}</div>
                                      </td>
                                      <td>
                                        <div className="widget-26-job-category bg-soft-base">
                                          <i className="indicator bg-base"></i>
                                          <span>{result.EventType}</span>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="widget-26-job-starred">
                                          <a
                                            href="#"
                                            className={result.isFavourited ? 'star active' : 'star'}
                                            onClick={(event) => handleStarClick(result.Id, result.Name, event)}
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="24"
                                              height="24"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="feather feather-star"
                                            >
                                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                            </svg>
                                          </a>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          // Grid (Tile) View
                          <div className="result-body">
                            <div className="tile-container">
                              {currentItems.length > 0 && currentItems.map((result, index) => (
                                <div key={index} className="tile-item">
                                  <button onClick={() => handleRedirect(result.Id)}>
                                    {result.Name}
                                  </button>
                                  <p>{result.EventDate.toLocaleDateString()}</p>
                                  <p>{result.City}</p>
                                  <p>{result.EventOrganiser}</p>
                                  <p>{result.EventType}</p>
                                  <a
                                    href="#"
                                    className={result.isFavourited ? 'star active' : 'star'}
                                    onClick={(event) => handleStarClick(result.Id, result.Name, event)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="feather feather-star"
                                    >
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <nav className="d-flex justify-content-center">
                  <ul className="pagination pagination-base pagination-boxed pagination-square mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link no-border" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                        «
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button className="page-link no-border" onClick={() => setCurrentPage(index + 1)}>
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link no-border" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        »
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container carousel-container mt-4">
          <div className="row">
            {/* Carousel */}
            <div className="col-sm-6 col-sm-offset-1">
              <div id="carousel-example-generic" className="carousel slide" data-ride="carousel">
                {/* Indicators */}
                <ol className="carousel-indicators">
                  {recommendedEventResults.map((_, index) => (
                    <li
                      key={index}
                      data-target="#carousel-example-generic"
                      data-slide-to={index}
                      className={index === currentCarouselIndex ? "active" : ""}
                      onClick={() => setCurrentCarouselIndex(index)}
                    />
                  ))}
                </ol>

                {/* Wrapper for slides */}
                <div className="carousel-inner" role="listbox">
                  {recommendedEventResults.map((event, index) => (
                    <div
                      key={event.Id}
                      className={`item ${index === currentCarouselIndex ? "active" : ""}`}
                    >
                      <img
                        src={event.PresignedImageURL}
                        alt={event.Name}
                        onClick={() => handleRedirect(event.Id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <a
                  className="left carousel-control"
                  href="#carousel-example-generic"
                  role="button"
                  onClick={handlePrev}
                >
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                  <span className="sr-only">Previous</span>
                </a>
                <a
                  className="right carousel-control"
                  href="#carousel-example-generic"
                  role="button"
                  onClick={handleNext}
                >
                  <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                  <span className="sr-only">Next</span>
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-sm-3">
              <div className="result">
                {recommendedEventResults.map((event, index) => (
                  <p
                    key={event.Id}
                    data-target="#carousel-example-generic"
                    data-slide-to={index}
                    className={index === currentCarouselIndex ? "active-p" : ""}
                    onClick={() => setCurrentCarouselIndex(index)}
                  >
                    {`${index + 1}. ${event.Name}`}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default EventSearchPage;
