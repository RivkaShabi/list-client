import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autocomplete from 'react-autocomplete';

const API_URL = "https://localhost:44341/api/client";

function ClientList() {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [skip, setSkip] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [autocompleteData, setAutocompleteData] = useState([]);

    useEffect(() => {
        fetchClients();
        fetchAutocompleteData();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${API_URL}?skip=${skip}&take=10`);
            setClients([...clients, ...response.data]);
            setSkip(skip + 10);

            if (response.data.length < 10) {
                setHasMoreData(false);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchAutocompleteData = async () => {
        try {
            const response = await axios.get(`${API_URL}/autocomplete`);
            setAutocompleteData(response.data);
        } catch (error) {
            console.error('Error fetching autocomplete data:', error);
        }
    };

    const filterSuggestions = (items, value) => {
        if (!value) {
            return items;
        }
        const searchTerm = value.toLowerCase();
        return items.filter((item) => item.name.toLowerCase().includes(searchTerm) || item.clientId.toString().includes(searchTerm));
    };

    const handleSearch = async () => {
        try {
            console.log(searchTerm);
            if(searchTerm === "" || searchTerm === null){
                setSkip(10);
                setHasMoreData(true);
            }
            else {
                setHasMoreData(false);
            } 
            const response = await axios.get(`${API_URL}/search?searchTerm=${searchTerm}`);
            setClients(response.data);
            
        } catch (error) {
            console.error('Error searching clients:', error);
        }
    };

    const handleLoadMore = () => {
        fetchClients();
    };

    return (
        <div>
            <Autocomplete
                getItemValue={(item) => item.name}
                items={filterSuggestions(autocompleteData, searchTerm)}
                renderItem={(item, isHighlighted) => (
                    <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                       {item.clientId} - {item.name} 
                    </div>
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSelect={(value) => setSearchTerm(value)}
            />
            <button onClick={handleSearch}>Search</button>

            <ul>
                {clients.map((client) => (
                    <li key={client.clientId}>
                        {client.clientName} - {client.nextAppointmentDate && client.appointmentType !== "No appointment" ? new Date(client.nextAppointmentDate).toLocaleDateString('en-GB') : ''} - {client.appointmentType}
                    </li>
                ))}
            </ul>
            {hasMoreData && <button onClick={handleLoadMore}>Load More</button>}
        </div>
    );
}

export default ClientList;
