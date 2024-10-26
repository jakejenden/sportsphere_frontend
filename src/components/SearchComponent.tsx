import React, { useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap'; // Import any necessary dependencies
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom'; // Correct import

interface EventSuggestion {
  EventId: number;
  EventName: string;
}

interface SearchComponentProps {
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchMethod: string;
  setSearchMethod: (method: string) => void;
  setEventSuggestions: (eventSuggestion: EventSuggestion[]) => void;
  eventSuggestions: Array<EventSuggestion>;
  activeIndex: number;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  handleSearch,
  searchTerm,
  setSearchTerm,
  searchMethod,
  setSearchMethod,
  setEventSuggestions,
  eventSuggestions,
  activeIndex,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for suggestions dropdown
  const navigate = useNavigate();
  
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;

    let eventSuggestions: AxiosResponse<EventSuggestion[]> | null = null;
    if (value.length > 2) {
      try {
        if (searchMethod.trim() === 'name') {
          eventSuggestions = await axios.get(`${API_URL}/geteventsuggestionbyname?eventName=${value}`, {
            withCredentials: true,
          });
        } else if (searchMethod.trim() === 'location') {
          eventSuggestions = await axios.get(`${API_URL}/geteventsuggestionbycity?city=${value}`, {
            withCredentials: true,
          });
        } else if (searchMethod.trim() == 'organiser') {
          eventSuggestions = await axios.get(`${API_URL}/geteventsuggestionbyorganiser?organiser=${value}`, {
            withCredentials: true,
          });
        }

        if (eventSuggestions && eventSuggestions.data && Array.isArray(eventSuggestions.data)) {
          const fetchedSuggestions: EventSuggestion[] = eventSuggestions.data;
          setEventSuggestions(fetchedSuggestions);
        } else {
          setEventSuggestions([]);
        }
      } catch (error) {
        console.error('error fetching event suggestions: ', error);
      }
    } else {
      setEventSuggestions([]);
    }
  };

  const handleSuggestionClick = (eventId: number) => {
    navigate(`/event/${eventId}`);
    setEventSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeDropdown = () => {
    // Logic to close the dropdown (clear event suggestions)
    setEventSuggestions([]);
  };

  return (
    <div className="row">
      <div className="col-lg-12 card-margin">
        <div className="card search-form">
          <div className="card-body p-0">
            <Form id="search-form" onSubmit={handleSearch}>
              <div className="row">
                <div className="col-12">
                  <div className="row no-gutters">
                    {/* Dropdown for search method */}
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

                    {/* Search input */}
                    <div className="col-lg-8 col-md-6 col-sm-12 p-0 position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Search..."
                        className="form-control"
                        id="search"
                        name="search"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setSearchTerm(e.target.value);
                          handleInputChange(e);
                        }}
                      />

                      {/* Dropdown suggestions */}
                      {eventSuggestions.length > 0 && (
                        <div className="dropdown-content" ref={dropdownRef}>
                          <ul className="suggestions-list">
                            {eventSuggestions.map((eventSuggestion, index) => (
                              <li
                                key={index}
                                className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => handleSuggestionClick(eventSuggestion.EventId)}
                              >
                                {eventSuggestion.EventName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Search button */}
                    <div className="col-lg-1 col-md-3 col-sm-12 p-0 search-button-wrapper">
                      <Button type="submit" className="btn btn-base">
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
                          className="feather feather-search"
                        >
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
  );
};

export default SearchComponent;
