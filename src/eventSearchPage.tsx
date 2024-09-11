import React, { useState, useEffect } from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Correct import
import axios from 'axios';
import './eventSearchPage.css';

interface EventResult {
  Id: number,
  Name: string;
  Street: string;
  City: string;
  County: string;
  PostCode: string;
  EventDate: Date;
  EventType: string;
  EventOrganiser: string;
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [location, setLocation] = useState<string>('');
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const navigate = useNavigate();

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

  const handleSearch = async () => {
      try {
          document.cookie = `token=${token}; path=/`;

          const response = await axios.get<EventResult[]>(`http://localhost:3030/returnresults?title=${searchTerm}`, {
              withCredentials: true,
          });

          const fetchedResults: EventResult[] = response.data.map((item: any) => ({
              ...item,
              EventDate: new Date(item.EventDate),
              isFavourited: isFavourite(item.Id) // Initialize isFavourited
          }));

          setEventResults(fetchedResults);
      } catch (error) {
          console.error('Error fetching event data:', error);
      }
  };

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, [searchTerm]); // Fetch results whenever `searchTerm` changes

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3030/logout', {
        withCredentials: true,
      });

      localStorage.removeItem('token');

      navigate('/login'); // Use navigate to redirect after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
      // Fetch the favourites when the component mounts
      const fetchFavourites = async () => {
          try {
              const response = await axios.get<Favourite[]>(`http://localhost:3030/getfavourites`, {
                  withCredentials: true,
              });
              setFavourites(response.data);
              console.log("favourites in fetchFavourites: ", favourites)
          } catch (error) {
              console.error("Error fetching favourites:", error);
          }
      };

      fetchFavourites();
  }, []);

  const isFavourite = (eventId: number): boolean => {
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
            const response = await axios.delete<ApiResponse>('http://localhost:3030/deletefavourite', {
                data: payload,
                withCredentials: true,
            });
            if (response.data.success) {
                // Fetch the updated favourites list
                const updatedFavourites = await axios.get<Favourite[]>('http://localhost:3030/getfavourites', {
                    withCredentials: true,
                });
                setFavourites(updatedFavourites.data);
            }
        } else {
            // Add favourite
            const response = await axios.post<ApiResponse>('http://localhost:3030/addfavourite', payload, {
                withCredentials: true,
            });
            if (response.data.success) {
                // Fetch the updated favourites list
                const updatedFavourites = await axios.get<Favourite[]>('http://localhost:3030/getfavourites', {
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
        <h2 className="event-search-title">Event Search</h2>
        <div className="logout-container">
          <Button variant="primary" onClick={handleLogout} className="logout-button">
            Logout
          </Button>
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
                            id="exampleFormControlSelect1"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          >
                            <option value="">Location</option>
                            <option value="London">London</option>
                            <option value="Boston">Bournemouth</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="New York">New York</option>
                            <option value="Toronto">Toronto</option>
                            <option value="Paris">Paris</option>
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
                                            <div className="records">Showing: <b>1-20</b> of <b>200</b> result</div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="result-actions">
                                                <div className="result-sorting">
                                                    <span>Sort By:</span>
                                                    <select className="form-control border-0" id="exampleOption">
                                                        <option value="1">Relevance</option>
                                                        <option value="2">Names (A-Z)</option>
                                                        <option value="3">Names (Z-A)</option>
                                                    </select>
                                                </div>
                                                <div className="result-views">
                                                    <button type="button" className="btn btn-soft-base btn-icon">
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
                                                    <button type="button" className="btn btn-soft-base btn-icon">
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
                                    <div className="table-responsive">
                                        <table className="table widget-26">
                                            <tbody>
                                              {eventResults.map((result, index) => (
                                                  <tr key={index}>
                                                      <td>
                                                          <div className="widget-26-job-title">
                                                              <a href="#">{result.Name}</a>
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <nav className="d-flex justify-content-center">
                        <ul className="pagination pagination-base pagination-boxed pagination-square mb-0">
                            <li className="page-item">
                                <a className="page-link no-border" href="#">
                                    <span aria-hidden="true">«</span>
                                    <span className="sr-only">Previous</span>
                                </a>
                            </li>
                            <li className="page-item active"><a className="page-link no-border" href="#">1</a></li>
                            <li className="page-item"><a className="page-link no-border" href="#">2</a></li>
                            <li className="page-item"><a className="page-link no-border" href="#">3</a></li>
                            <li className="page-item"><a className="page-link no-border" href="#">4</a></li>
                            <li className="page-item">
                                <a className="page-link no-border" href="#">
                                    <span aria-hidden="true">»</span>
                                    <span className="sr-only">Next</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventSearchPage;
