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
 



  
  maptilersdk.config.apiKey = '3X7gJ3JxMg3rtJRuuo8n';

  

  
  

  

  const getPopupContent = (pin) => {
    if (!pin) {
      console.error('Pin is undefined:', pin);
      return '<div>Error: Pin data is missing</div>';
    }
    console.log("pin rating", pin.rating);
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

  const newplacePopUp = (newPlace) =>{
    return `
    <div>
      <form id= newPlaceForm>
        <label>Title</label>
        <input placeholder='Enter a title' id ="title"
        />
        <label>Review</label>
        <input placeholder='Experience tht the place gave you' id ="desc"
        />
        <label>Rating</label>
        <select id="rating">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <button type = "submit" class= "pinBtn">Add pin</button>
      </form>
    </div>
    `

  }

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      axios
        .get("/pins", { headers: { Authorization: token } })
        .then((res) => setPins(res.data))
        .catch((error) => console.error("Error fetching pins:", error));
    }
  }, [user]);

  
  

  const handleDoubleClick = (e) => {
    if (!user) {
      alert("You don't have permission to add pins..Login Or Register");
      return;
    }
    console.log(user);
  
    //if (!user) return; // Only allow logged-in users to add pins
    const { lng, lat } = e.lngLat;
    console.log('long:', lng, 'lat:', lat);
    setNewPlace({ lat, lng });
    
  };
  

  useEffect(() =>{
    if (!newPlace || !user)
      return;
    const marker = new maptilersdk.Marker({color: "#FF0000" })

    .setLngLat([newPlace.lng, newPlace.lat]) 
    .setPopup(
      new maptilersdk.Popup({ offset: 25 }) // Add a popup with an offset
        .setHTML(newplacePopUp(newPlace))
    )
    .addTo(map.current);
    

    marker.togglePopup();
    setNewPlace(null);

    const form = document.getElementById("newPlaceForm")
    if (form){
      form.addEventListener("submit", (e)=>{
        e.preventDefault();
        const title = document.getElementById("title").value;
        const desc = document.getElementById("desc").value;
        const rating = document.getElementById("rating").value;

        const newPin = {
          username: user,
          title,
          desc, 
          rating,
          lat: newPlace.lat,
          long: newPlace.lng
        };

        const token = localStorage.getItem("token");
        axios
          .post("/pins", newPin, { headers: { Authorization: token } })
          .then((res) => setPins([...pins, res.data]))
          .catch((error) => console.error("Error adding pin:", error));

        setNewPlace(null);
        marker.remove();

        
        
        
 
      });
      
    }
    
    marker.getElement().addEventListener("click", ()=>{
      map.current.flyTo({
        center:[newPlace.lng, newPlace.lat],
        essentail:true,
      });

    });

  }, [newPlace,user]);


  const markersRef = useRef([]);
  useEffect(() => {
   
    if (map.current) return; // stops map from intializing more than once

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.BASIC,
      center: [0,0],
      zoom: zoom,
    });
    
    console.log("Map initialized:", map.current);
     // Check if map.current is available
    map.current.on('dblclick', handleDoubleClick);
  
    

    


    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);


  useEffect(() => {
    if (!map.current) return; // Ensure the map is initialized
  
    // Clear existing markers (if any)
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    
    
    pins.forEach((pin) => {

    const marker = new maptilersdk.Marker({color: "#FF0000"})

      .setLngLat([pin.long,pin.lat]) 
      .setPopup(
        new maptilersdk.Popup({ offset: 25 }) // Add a popup with an offset
          .setHTML(getPopupContent(pin))
      )
      .addTo(map.current);

      marker.getElement().addEventListener("click", ()=>{
        map.current.flyTo({
          center:[pin.long, pin.lat],
          essentail:true,
        });
        

      });
      markersRef.current.push(marker);
      
      
    });
  },[pins, user]);

 

  

    return (
      <div className="map-wrap">
      
      <div ref={mapContainer} className="map" />
    </div>
      

      
    );


  
  }


  