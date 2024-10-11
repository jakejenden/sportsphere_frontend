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

function formatFileName(fileName: string): string {
    // Remove the file extension using regex
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

    // Replace underscores with spaces
    const formattedName = nameWithoutExtension.replace(/_/g, " ");

    return formattedName;
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

  interface EventImage {
    PresignedURL: string;
}

const EventPage: React.FC = () => {
    const { eventId } = useParams();
    const [eventGPXDataList, setEventGPXDataList] = useState<GPXData[]>([]);
    const [eventDetails, setEventDetails] = useState<EventDetails | undefined>(undefined);
    const [imageURL, setImageURL] = useState<EventImage>();
    const navigate = useNavigate();

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

        fetchEventDetails();
        fetchEventGPXData();
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
                            <div className="card-body p-1-9 p-xl-5">
                                <div className="mb-4">
                                    <h3 className="h4 mb-0">Dakota Johnston</h3>
                                    <span className="text-primary">CEO &amp; Founder</span>
                                </div>
                                <ul className="list-unstyled mb-4">
                                    <li className="mb-3"><a href="#!"><i className="far fa-envelope display-25 me-3 text-secondary"></i>dakota@gmail.com</a></li>
                                    <li className="mb-3"><a href="#!"><i className="fas fa-mobile-alt display-25 me-3 text-secondary"></i>+012 (345) 6789</a></li>
                                    <li><a href="#!"><i className="fas fa-map-marker-alt display-25 me-3 text-secondary"></i>205 Main Street, USA</a></li>
                                </ul>
                                <ul className="social-icon-style2 ps-0">
                                    <li><a href="#!" className="rounded-3"><i className="fab fa-facebook-f"></i></a></li>
                                    <li><a href="#!" className="rounded-3"><i className="fab fa-twitter"></i></a></li>
                                    <li><a href="#!" className="rounded-3"><i className="fab fa-youtube"></i></a></li>
                                    <li><a href="#!" className="rounded-3"><i className="fab fa-linkedin-in"></i></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="ps-lg-1-6 ps-xl-5">
                            <div className="mb-5 wow fadeIn">
                                <div className="text-start mb-1-6 wow fadeIn">
                                    <h2 className="h1 mb-0 text-primary">{ eventDetails?.Name }</h2>
                                </div>
                                <p>This is a really really fun triathlon!</p>
                                <p className="mb-0">There are many variations of passages of Lorem Ipsum available...</p>
                            </div>
                            <div className="mb-5 wow fadeIn">
                                <div className="text-start mb-1-6 wow fadeIn">
                                    <h2 className="mb-0 text-primary">Stats</h2>
                                </div>
                                <div className="row mt-n4">
                                    <div className="col-sm-6 col-xl-4 mt-4">
                                        <div className="card text-center border-0 rounded-3">
                                            <div className="card-body">
                                                <i className="ti-bookmark-alt icon-box medium rounded-3 mb-4"></i>
                                                <h3 className="h5 mb-3">Distances</h3>
                                                <p className="mb-0">University of defgtion...</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 col-xl-4 mt-4">
                                        <div className="card text-center border-0 rounded-3">
                                            <div className="card-body">
                                                <i className="ti-pencil-alt icon-box medium rounded-3 mb-4"></i>
                                                <h3 className="h5 mb-3">Location</h3>
                                                <p className="mb-0">After complete engineer join HU Signage Ltd...</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 col-xl-4 mt-4">
                                        <div className="card text-center border-0 rounded-3">
                                            <div className="card-body">
                                                <i className="ti-medall-alt icon-box medium rounded-3 mb-4"></i>
                                                <h3 className="h5 mb-3">Date</h3>
                                                <p className="mb-0">About 20 years of experience...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="wow fadeIn">
                                <div className="text-start mb-1-6 wow fadeIn">
                                    <h2 className="mb-0 text-primary">#Skills &amp; Experience</h2>
                                </div>
                                <p className="mb-4">Many desktop publishing packages and web page editors...</p>
                                <div className="progress-style1">
                                    <div className="progress-text">
                                        <div className="row">
                                            <div className="col-6 fw-bold">Wind Turbines</div>
                                            <div className="col-6 text-end">70%</div>
                                        </div>
                                    </div>
                                    <div className="custom-progress progress rounded-3 mb-4">
                                        <div className="animated custom-bar progress-bar slideInLeft" style={{ width: '70%' }} aria-valuemax={100} aria-valuemin={0} aria-valuenow={70} role="progressbar"></div>
                                    </div>
                                    <div className="progress-text">
                                        <div className="row">
                                            <div className="col-6 fw-bold">Solar Panels</div>
                                            <div className="col-6 text-end">90%</div>
                                        </div>
                                    </div>
                                    <div className="custom-progress progress rounded-3 mb-4">
                                        <div className="animated custom-bar progress-bar bg-secondary slideInLeft" style={{ width: '90%' }} aria-valuemax={100} aria-valuemin={0} aria-valuenow={90} role="progressbar"></div>
                                    </div>
                                    <div className="progress-text">
                                        <div className="row">
                                            <div className="col-6 fw-bold">Hybrid Energy</div>
                                            <div className="col-6 text-end">80%</div>
                                        </div>
                                    </div>
                                    <div className="custom-progress progress rounded-3">
                                        <div className="animated custom-bar progress-bar bg-dark slideInLeft" style={{ width: '80%' }} aria-valuemax={100} aria-valuemin={0} aria-valuenow={80} role="progressbar"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {Array.isArray(eventGPXDataList) && eventGPXDataList.length > 0 ? (
                        eventGPXDataList.map((gpxItem, index) => {
                            console.log('Rendering GPX Item:', gpxItem); // Debug log
                            return (
                                <div key={index}>
                                    <h2>{formatFileName(gpxItem.Key)}</h2> {/* Title as the event key */}
                                    <MapboxMap gpxData={gpxItem.GPX} />
                                </div>
                            );
                        })
                    ) : (
                        <p></p>
                    )}
                </div>
            </div>
        </>
    );
}

export default EventPage;

