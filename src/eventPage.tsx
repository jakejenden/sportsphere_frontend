import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Correct import
import axios from 'axios';
import './eventSearchPage.css';
import { API_URL } from './config';
import MapboxMap from "./MapboxMap";
import './MapboxMap.css'

interface GPXData {
    Key: string;
    GPX: string; // GPX data in string format (can be base64 encoded)
}

interface EventDetails {
    Id: number;
    Name: string;
    Street: string;
    City: string;
    County: string;
    PostCode: string;
    EventDate: Date;
    EventType: string;
    Distance: string;
    EventOrganiser: string;
}

interface DisciplineDetail {
    Id: number;
    EventName: string;
    Category: string;
    DisciplineName: string;
    TotalDistance: number;
    Metric: string;
    Laps: number;
}

  interface EventImage {
    PresignedURL: string;
}

const EventPage: React.FC = () => {
    const { eventId } = useParams();
    const [eventGPXDataList, setEventGPXDataList] = useState<GPXData[]>([]);
    const [discDetailsList, setDiscDetailsList] = useState<DisciplineDetail[]>([]);
    const [eventDetails, setEventDetails] = useState<EventDetails | undefined>(undefined);
    const [imageURL, setImageURL] = useState<EventImage>();
    const navigate = useNavigate();

    const groupedByCategory = discDetailsList.reduce((acc, discItem) => {
    if (!acc[discItem.Category]) {
        acc[discItem.Category] = [];
    }
    acc[discItem.Category].push(discItem); // Push the entire object
    return acc;
    }, {} as { [key: string]: { DisciplineName: string; TotalDistance: number; Metric: string }[] });

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
    }

    useEffect(() => {
        const fetchEventGPXData = async () => {
            if (eventId) {
                const id = Number(eventId); // Convert string to number
                if (!isNaN(id)) { // Check if id is a valid number

                    try {
                        // Use the id variable here
                        const gpxResponse = await axios.post(`${API_URL}/getgpxroutes`, { EventId: id }, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            withCredentials: true,
                        });

                        if (Array.isArray(gpxResponse.data)) {
                            setEventGPXDataList(gpxResponse.data);
                        } else {
                            console.error('Unexpected data format:', gpxResponse.data);
                        }

                    } catch (error) {
                        console.error('Error fetching GPX routes data:', error);
                    }
                } else {
                    console.error('Invalid EventId');
                }
            } else {
                console.error('EventId is undefined');
            }
        };

        const fetchEventDetails = async () => {
            if (eventId) {
                const id = Number(eventId); // Convert string to number
                if (!isNaN(id)) { // Check if id is a valid number
                    try {
                        const getEventResultsResponse = await axios.get<EventDetails>(`${API_URL}/getresultsbyeventid?id=${eventId}`, {
                            withCredentials: true,
                        });
                        console.log(getEventResultsResponse);

                        const eventData: EventDetails = {
                            ...getEventResultsResponse.data,
                            EventDate: new Date(getEventResultsResponse.data.EventDate),
                        }

                        setEventDetails(eventData);

                    } catch (error) {
                        console.error('Error fetching event details:', error);
                    }
                } else {
                    console.error('Invalid EventId');
                }
            } else {
                console.error('EventId is undefined');
            }
        };

        const fetchDisplineDetails = async () => {
            if (eventId) {
                const id = Number(eventId);
                if (!isNaN(id)) {
                    try {
                        const getDisplineDetails = await axios.post(`${API_URL}/getdisciplines`, { EventId: id }, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            withCredentials: true,
                        });
    
                        if (Array.isArray(getDisplineDetails.data)) {
                            setDiscDetailsList(getDisplineDetails.data);
                        } else {
                            console.error('Unexpected data format:', getDisplineDetails.data);
                        }
                    } catch (error) {
                        console.error('Error fetching desciplines:', error)
                    }
                } else {
                    console.error('Invalid EventId');
                }
            } else {
                console.error('EventId is undefined');
            }
        };

        fetchEventDetails();
        fetchEventGPXData();
        fetchDisplineDetails();
    }, [eventId]); // Runs only when eventId changes

    useEffect(() => {
        const fetchImagePresignedURL = async () => {
            if (eventDetails) {
                try {
                    const getImageResponse = await axios.get<EventImage>(`${API_URL}/geteventimage?eventName=${eventDetails.Name}`, {
                        withCredentials: true,
                    });

                    setImageURL(getImageResponse.data);
                } catch (error) {
                    console.error('Error fetching event image URL:', error);
                }
            } else {
                console.error('eventDetails is undefined');
            }
        };

        fetchImagePresignedURL();
    }, [eventDetails]);

    const handleBackToSearch = () => {
        navigate('/return-results');
    };

    return (
        <>
            <div className="container">
                <button onClick={handleBackToSearch}>Back to Search Events</button>
                <div className="row justify-content-center">
                    <div className="col-md-7 col-lg-4 mb-5 mb-lg-0 wow fadeIn">
                        <div className="card border-0 shadow">
                            <img src={imageURL?.PresignedURL} alt="..." />
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="ps-lg-1-6 ps-xl-5">
                            <div className="mb-5 wow fadeIn">
                                <div className="text-start mb-1-6 wow fadeIn">
                                    <h2 className="h1 mb-0 text-primary">{ eventDetails?.Name }</h2>
                                </div>
                                <p>This is a really really fun triathlon!</p>
                            </div>
                            <div className="mb-5 wow fadeIn">
                                <div className="text-start mb-1-6 wow fadeIn">
                                    <h2 className="mb-0 text-primary">Event Details</h2>
                                </div>
                                {Array.isArray(discDetailsList) && discDetailsList.length > 0 ? (
                                    <div className="row mt-n4">
                                        <div className="col-sm-6 col-xl-4 mt-4">
                                            <div className="card rounded-3">
                                                <div className="card-body">
                                                    <i className="ti-bookmark-alt icon-box medium rounded-3 mb-4"></i>
                                                    <h3 className="h5 mb-3">Distances</h3>
                                                    {Object.keys(groupedByCategory).map((category) => (
                                                        <div key={category}>
                                                        {/* Render category name */}
                                                        <h4 className="h5 mb-3">{category}</h4>
                                                        <ul>
                                                            {groupedByCategory[category].map((discipline, index) => (
                                                            <li key={index}>
                                                                <p className="mb-0">
                                                                {discipline.TotalDistance} {discipline.Metric} {discipline.DisciplineName}
                                                                </p>
                                                            </li>
                                                            ))}
                                                        </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6 col-xl-4 mt-4">
                                            <div className="card rounded-3">
                                                <div className="card-body">
                                                    <i className="ti-pencil-alt icon-box medium rounded-3 mb-4"></i>
                                                    <h3 className="h5 mb-3">Location</h3>
                                                    <p className="mb-0">{eventDetails?.Street},</p>
                                                    <p className="mb-0">{eventDetails?.City},</p>
                                                    <p className="mb-0">{eventDetails?.County},</p>
                                                    <p className="mb-0">{eventDetails?.PostCode}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6 col-xl-4 mt-4">
                                            <div className="card rounded-3">
                                                <div className="card-body">
                                                    <i className="ti-medall-alt icon-box medium rounded-3 mb-4"></i>
                                                    <h3 className="h5 mb-3">Event Date</h3>
                                                    <p className="mb-0">{eventDetails?.EventDate.toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p></p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {Array.isArray(eventGPXDataList) && eventGPXDataList.length > 0 ? (
                    <div>
                        <h2>Course Map</h2> {/* Title as the event key */}
                        <MapboxMap gpxDataList={eventGPXDataList} />
                    </div>
                    ) : (
                        <p></p>
                    )}
                </div>
            </div>
        </>
    );
}

export default EventPage;

