import { useState } from 'hono/jsx';

export function Main() {
    const [formData, setFormData] = useState({
        ssid: '',
        password: '',
        security: 'WPA',
    });

    interface FormData {
        ssid: string;
        password: string;
        security: string;
    }

    const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const { name, value } = target;
        setFormData((prevData: FormData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e:Event) => {
        e.preventDefault();
        
        // Get geolocation data if available
        let latitude = 0;
        let longitude = 0;

        if (navigator.geolocation) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                });
                
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                console.log('Location obtained:', latitude, longitude);
            } catch (geoError) {
                console.warn('Geolocation error:', geoError);
                // Continue with default coordinates (0,0)
            }
        }

        try {
            const response = await fetch('/wifi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    captive:false,
                    latitude,
                    longitude
                })
            });
            
            const data = await response.json();
            console.log('Success:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <></>
    );
}