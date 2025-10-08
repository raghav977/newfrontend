import { Leaf } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import LeafletMap from "../components/map/LeafletMap";

export default function MapComponent(){
    const [position, setPosition] = useState(null);

    const getUserLocation = ()=>{
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition((position)=>{
                const {latitude, longitude} = position.coords;
                setPosition({latitude, longitude});
                console.log("User's location:", latitude, longitude);
            }, (error)=>{
                console.error("Error fetching location:", error);
            });
        }
    }

    useEffect(()=>{
        getUserLocation();
    }, []);

    const mapRef = useRef(null);
    return <div>
        <div ref={mapRef} className="w-full h-full" />
        {position && <p>Latitude: {position.latitude}, Longitude: {position.longitude}</p>}

        {/* integrate the map from leaflet the marker is set to the current latitude,longitude and then the user has only option to select the radius that's too up to 50km
         */}
        {/* Use leaflet or any other map library to show the map */}
        {/* You can use react-leaflet or any other library */}
        {/* For simplicity, we are just showing the coordinates here */}
            <LeafletMap position={position} mapRef={mapRef} />
    </div>
}