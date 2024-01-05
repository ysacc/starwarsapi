import  { useState, useEffect, FC } from 'react';
import './App.css';
import { ClipLoader } from 'react-spinners';
import { IoIosArrowForward } from "react-icons/io";

interface Character {
  name: string;
  species: string;
  homeworld: string;
  eye_color: string;
  hair_color: string;
  skin_color: string;
  birth_year: string;
  vehicles: string[];
}

const App: FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://swapi.dev/api/people/');
      const data = await response.json();

      const charactersWithDetails = await Promise.all(
        data.results.map(async (character: Character) => {
          const speciesName = character.species ? await fetchDetails(character.species) : 'Human';
          const homeworldName = await fetchDetails(character.homeworld);

          const vehicles = await Promise.all(character.vehicles.map(async (vehicleUrl: string) => {
            return await fetchDetails(vehicleUrl);
          }));

          return {
            ...character,
            species: speciesName,
            homeworld: homeworldName,
            vehicles,
          };
        })
      );

      setCharacters(charactersWithDetails);
      setLoading(false);

      // Limpiamos cualquier mensaje de error previo si la carga es exitosa
      setError(null);

      if (charactersWithDetails.length === 0) {
        // Si no hay datos después de la carga, establecemos un mensaje de error
        setError('No characters found.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setError('Failed to load data. Please try again.');
    }
  };

  const fetchDetails = async (url: string) => {
    try {
      console.log('Fetching details for:', url);

      // Verificar si la "URL" es en realidad el nombre del vehículo (por ejemplo, "Imperial Speeder Bike")
      const isNameOnly = !url.startsWith('https://');

      if (isNameOnly) {
        console.log('Details response:', { name: url });
        return url;
      }

      // Si es una URL, realizar la llamada a la API
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Intenta obtener el nombre desde varias propiedades
      const name = data.name || data.title || data.model || 'N/A';

      console.log('Details response:', data);
      return name;
    } catch (error) {
      console.error('Error fetching details:', error);
      return 'Human';
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleCardClick = async (character: Character) => {
    const vehicles = await Promise.all(character.vehicles.map(async (vehicleUrl: string) => {
      return await fetchDetails(vehicleUrl);
    }));
  
    const selectedCharacterWithDetails: Character = {
      ...character,
      vehicles,
    };
  
    setSelectedCharacter(selectedCharacterWithDetails);
  };
  
return (
  <div className="app-container">
    <div className="titlebar">
      <div className='label'>Ravn Star Wars Registry</div>
    </div>
    <div className="sidebar">
      {loading ? (
        <ClipLoader color="black" size={50} loading={loading}/>
      ) : (
        <div>
          {characters.map((character, index) => (
            <div className="card" key={index} onClick={() => handleCardClick(character)}>
              <div className="card-content">
                <h2>{character.name}</h2>
                <p>{character.species} from {character.homeworld}</p>
              </div>
              <div className="arrow-icon">
                <IoIosArrowForward />
              </div>
              </div>
          ))}
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
    <div className="main-content">
      {selectedCharacter && (
        <div className="details-box">
          <div>
            <h3>General Information</h3>
            <div className="details-row">
              <p className="detail-label">Eye Color:</p>
              <p>{selectedCharacter.eye_color}</p>
            </div>
            <div className="details-row">
              <p className="detail-label">Hair Color:</p>
              <p>{selectedCharacter.hair_color}</p>
            </div>
            <div className="details-row">
              <p className="detail-label">Skin Color:</p>
              <p>{selectedCharacter.skin_color}</p>
            </div>
            <div className="details-row">
              <p className="detail-label">Birth Year:</p>
              <p>{selectedCharacter.birth_year}</p>
            </div>
          </div>
          <div>
            <h3>Vehicles</h3>
            <div>
              {selectedCharacter.vehicles.map((vehicle, index) => (
                <p className="vehicle-label"key={index}>{vehicle}</p>
              ))}
            </div>
          </div>
      {/* <button onClick={() => setSelectedCharacter(null)}>Back</button> */}
    </div>
  )}
</div>

  </div>
);
};

export default App
