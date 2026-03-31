import { useState } from 'react'
import './App.css'

const API_KEY = import.meta.env.VITE_ART_API_KEY;

function App() {
  const [currentPainting, setCurrentPainting] = useState(null)
  const [seenWorks, setSeenWorks] = useState([])
  const [banned, setBanned] = useState([])

  const addToBanned = (attribute) => {
    if (!banned.includes(attribute)) {
      setBanned((prev) => [...prev, attribute])
    }
  }

  const handleRequest = async (trials = 0) => {

    const url = `https://api.harvardartmuseums.org/object?apikey=${API_KEY}&hasimage=1&size=1&sort=random&classification=Paintings`;
    if (trials > 10) {
      alert("All available paintings match your ban list! Try unbanning something.");
      return;
    }
    try {
      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Response: ${errorText}`);
      }

      const data = await response.json()


      const artwork = data.records[0];

      if (artwork && artwork.primaryimageurl) {
        const newPainting = {
          image: artwork.primaryimageurl,
          title: artwork.title,
          author: artwork.people?.[0]?.displayname || "Unknown",
          century: artwork.century || "Unknown Century",
          culture: artwork.culture || "Unknown Culture"
        };

        const isBanned = banned.includes(newPainting.author) ||
          banned.includes(newPainting.century) ||
          banned.includes(newPainting.culture);

        if (isBanned) {
          return handleRequest(trials + 1)
        }


        // 2. Append everything into one object
        setCurrentPainting(newPainting);
        setSeenWorks((prev) =>
          [{ image: newPainting.image, title: newPainting.title }, ...prev])
      } else {
        return handleRequest(trials + 1);
      }
    }
    catch (error) {
      console.error("API Error: ", error)
    };
  }


  return (
    <div>
      <div className='main-container'>
        <div className='side-container'>
          <h2>What have we seen so far?</h2>
          <div className="history-list">
            {seenWorks.length > 0 ? (
              seenWorks.map((painting, index) => (
                <div key={index} className="history-item">
                  <img
                    src={painting?.image}
                    alt={painting?.title}
                    className="history-thumb"
                  />
                  <p>{painting?.title}</p>
                </div>
              ))
            ) : (
              <p></p>
            )}
          </div>
        </div>
        <div className="middle-column">
          <h1>Veni-Vici!</h1>
          <h3>Discover paintings from all over the world</h3>

          {/* Only show this block if we have a painting */}
          {currentPainting && (
            <div className="artwork-card">
              <h2>{currentPainting.title}</h2>

              <div className="property-buttons">
                <button className="prop-btn" onClick={() => addToBanned(currentPainting.author)}>{currentPainting.author}</button>
                <button className="prop-btn" onClick={() => addToBanned(currentPainting.culture)}>{currentPainting.culture}</button>
                <button className="prop-btn" onClick={() => addToBanned(currentPainting.century)}>{currentPainting.century}</button>
              </div>

              <img
                src={currentPainting.image}
                alt={currentPainting.title}
                className="main-artwork-img"
              />
            </div>
          )}

          <br />
          <button className='discover-button' onClick={handleRequest}>
            🎨 Discover 🎨
          </button>
        </div>
        <div className='side-container'>
          <h2>Ban list</h2>
          <div className='property-buttons'>
            {banned.map((bannedItem, index) => (
              <button
                key={index}
                className='prop-btn'
                onClick={() => setBanned(banned.filter(item => item !== bannedItem))}>
                {bannedItem}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
