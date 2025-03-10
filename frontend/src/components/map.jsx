import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import axios from "axios";
import {format} from 'timeago.js';

export default function Map({user}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const zoom = 1.5;
  const [pins, setPins] = useState([]);
  const [newPlace, setNewPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorTimeout, setErrorTimeout] = useState(null);
  
  // MapTiler API key
  maptilersdk.config.apiKey = '3X7gJ3JxMg3rtJRuuo8n';

  // Debug render
  console.log("Map component rendering with user:", user);
  console.log("Current authentication state:", isAuthenticated);

  // Force authentication state update when user prop changes
  useEffect(() => {
    console.log("User prop changed in Map component:", user);
    console.log("Local storage token:", localStorage.getItem("token"));
    console.log("Local storage user:", localStorage.getItem("user"));
    
    // Force update of authentication state
    if (user && user.username) {
      console.log("Setting isAuthenticated to TRUE for user:", user.username);
      setIsAuthenticated(true);
    } else {
      console.log("Setting isAuthenticated to FALSE, no valid user");
      setIsAuthenticated(false);
      // Clear any active new place when logging out
      setNewPlace(null);
    }
  }, [user]);

  // Function to generate popup HTML content for existing pins
  const getPopupContent = (pin) => {
    if (!pin) {
      console.error('Pin is undefined:', pin);
      return '<div>Error: Pin data is missing</div>';
    }
    
    const stars = Array.from({ length: pin.rating }, (_, index) => `
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#FFD700">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  `).join('');
    
    return `
      <div class="card">
        <label>Place</label>
        <h4 class="place">${pin.title}</h4>
        <label>Rating</label>
        <div class="stars">
        ${stars}
        </div>
        <label>Review</label>
        <p>${pin.desc}</p>
        <label>Information</label>
        <span class="username">Created by <b>${pin.username}</b></span>
        <span class="date">${format(pin.createdAt)}</span>
      </div>
    `;
  };

  // Function to generate popup HTML for new pin creation form
  const newplacePopUp = () => {
    return `
    <div>
      <form id="newPlaceForm">
        <label>Title</label>
        <input placeholder='Enter a title' id="title" required />
        <label>Review</label>
        <input placeholder='Experience that the place gave you' id="desc" required />
        <label>Rating</label>
        <select id="rating">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <button type="submit" class="pinBtn">Add pin</button>
      </form>
    </div>
    `;
  }

  // Fetch pins when user state changes
  useEffect(() => {
    // Reset pins if user logs out
    if (!isAuthenticated) {
      console.log("Not authenticated, clearing pins");
      setPins([]);
      return;
    }
    
    // Fetch pins when user is logged in
    const fetchPins = async () => {
      console.log("Attempting to fetch pins for authenticated user");
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        
        // Get username from user prop or localStorage
        let username;
        if (user && user.username) {
          username = user.username;
        } else {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              username = parsedUser.username;
            } catch (err) {
              console.error("Error parsing user data from localStorage:", err);
              throw new Error("Invalid user data in localStorage");
            }
          } else {
            throw new Error("No user data found");
          }
        }
        
        console.log("Fetching pins for user:", username);
        
        // Get pins for the current user
        const response = await axios.get("/pins", { 
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Pins fetched successfully:", response.data);
        setPins(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching pins:", err);
        if (pins.length === 0) {
          setError("Failed to load pins. Please try again later.");
        } else {
          console.log("Not showing error because pins were previously loaded");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPins();
  }, [isAuthenticated, user]);

  // Handle double-click on map to create a new pin
  const handleDoubleClick = (e) => {
    console.log("Double-click detected, isAuthenticated:", isAuthenticated);
    console.log("Current user state:", user);
    console.log("Local storage token:", localStorage.getItem("token"));
    console.log("Local storage user:", localStorage.getItem("user"));
    
    // Force check authentication again
    const storedUser = localStorage.getItem("user");
    const hasToken = !!localStorage.getItem("token");
    
    if (hasToken && storedUser) {
      console.log("User data found in localStorage, proceeding with pin creation");
      const { lng, lat } = e.lngLat;
      console.log("Setting new place at coordinates:", lng, lat);
      setNewPlace({ lat, lng });
    } else if (!isAuthenticated) {
      alert("You must be logged in to add pins. Please login or register.");
    }
  };

  // Create new pin marker and form when newPlace is set
  useEffect(() => {
    if (!newPlace || !map.current) {
      console.log("Not creating pin form:", { 
        newPlace: !!newPlace,
        mapReady: !!map.current
      });
      return;
    }
    
    console.log("Creating new pin form at:", newPlace);
    
    // Create a new marker for the pin
    const marker = new maptilersdk.Marker({color: "#FF0000"})
      .setLngLat([newPlace.lng, newPlace.lat]) 
      .setPopup(
        new maptilersdk.Popup({ offset: 25 })
          .setHTML(newplacePopUp())
      )
      .addTo(map.current);
    
    // Show the popup immediately
    marker.togglePopup();
    
    // Add event listener to the form after popup is added to DOM
    setTimeout(() => {
      const form = document.getElementById("newPlaceForm");
      if (form) {
        console.log("Form found, attaching submit handler");
        form.addEventListener("submit", (e) => handleFormSubmit(e, marker));
      } else {
        console.error("Form element not found");
      }
    }, 100);
    
    // Handle form submission
    const handleFormSubmit = async (e, marker) => {
      e.preventDefault();
      
      const title = document.getElementById("title").value;
      const desc = document.getElementById("desc").value;
      const rating = document.getElementById("rating").value;
      
      console.log("Form values:", { title, desc, rating });
      
      if (!title || !desc) {
        alert("Title and review are required");
        return;
      }
      
      // Get user data from localStorage if not available in props
      let currentUser = user;
      if (!currentUser || !currentUser.username) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            currentUser = JSON.parse(storedUser);
            console.log("Using user data from localStorage:", currentUser);
          } catch (err) {
            console.error("Error parsing user data from localStorage:", err);
            alert("User data is invalid. Please log in again.");
            marker.remove();
            return;
          }
        } else {
          alert("You must be logged in to add pins");
          marker.remove();
          return;
        }
      }
      
      const newPin = {
        username: currentUser.username,
        title,
        desc, 
        rating,
        lat: newPlace.lat,
        long: newPlace.lng
      };
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        console.log("Submitting new pin:", newPin);
        
        const response = await axios.post("/pins", newPin, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        console.log("Pin created successfully:", response.data);
        setPins([...pins, response.data]);
        marker.remove();
        setNewPlace(null);
      } catch (err) {
        console.error("Error adding pin:", err);
        alert("Failed to add pin. Please try again.");
      }
    };
    
    // Cleanup function to remove marker when component unmounts or newPlace changes
    return () => {
      marker.remove();
    };
  }, [newPlace, map, user, pins]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Prevent multiple initializations
    
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.BASIC,
      center: [0, 0],
      zoom: zoom,
    });
    
    // Add double-click event listener
    map.current.on('dblclick', handleDoubleClick);
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.off('dblclick', handleDoubleClick);
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Reference to keep track of markers
  const markersRef = useRef([]);
  
  // Update markers when pins change
  useEffect(() => {
    if (!map.current) return;
    
    console.log("Updating markers for pins:", pins);
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add markers for all pins
    pins.forEach((pin) => {
      try {
        console.log("Creating marker for pin:", pin);
        
        const marker = new maptilersdk.Marker({color: "#FF0000"})
          .setLngLat([pin.long, pin.lat]) 
          .setPopup(
            new maptilersdk.Popup({ offset: 25 })
              .setHTML(getPopupContent(pin))
          )
          .addTo(map.current);
        
        // Add click event to fly to the pin
        marker.getElement().addEventListener("click", () => {
          map.current.flyTo({
            center: [pin.long, pin.lat],
            essential: true,
            zoom: 5
          });
        });
        
        // Store reference to marker
        markersRef.current.push(marker);
        console.log("Added marker for pin:", pin.title);
      } catch (err) {
        console.error("Error adding marker for pin:", pin, err);
      }
    });
    
    console.log("Total markers created:", markersRef.current.length);
  }, [pins]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => setError(null), 5000);
      setErrorTimeout(timeoutId);
    } else if (errorTimeout) {
      clearTimeout(errorTimeout);
      setErrorTimeout(null);
    }
  }, [error]);

  return (
    <div className="map-wrap">
      {loading && <div className="loading-overlay">Loading pins...</div>}
      {error && <div className="error-message">{error}</div>}
      <div ref={mapContainer} className="map" />
      {!isAuthenticated && (
        <div className="login-prompt">
          <p>Login or register to add and view pins</p>
        </div>
      )}
      {isAuthenticated && user && (
        <div className="user-info">
          <p>Logged in as: {user.username}</p>
          <p>Double-click on the map to add a pin</p>
        </div>
      )}
    </div>
  );
}