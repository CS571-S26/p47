import { useState } from 'react'

import './MapsMarkerPopup.css'

function MapsMarkerPopup({ concerts }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const concert = concerts[currentIndex]

  function handlePrev() {
    setCurrentIndex((prev) =>
      prev === 0 ? concerts.length - 1 : prev - 1
    )
  }

  function handleNext() {
    setCurrentIndex((prev) =>
      prev === concerts.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="map-popup-card">
      <img
        src={concert.image}
        alt={concert.artist}
        className="map-popup-image"
      />

      <span className="map-popup-date">
        {new Date(concert.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>

      <span className="map-popup-artist">{concert.artist}</span>

      <span className="map-popup-venue">{concert.venue}</span>

      <div className="map-popup-rating-row">
        <span className="map-popup-stars">
          {'★'.repeat(concert.rating)}
          {'☆'.repeat(5 - concert.rating)}
        </span>
        <span className="map-popup-rating">{concert.rating}.0</span>
      </div>

      {concerts.length > 1 ? (
        <>
          <div className="map-popup-nav">
            <button className="map-popup-nav-button" onClick={handlePrev}>
              ←
            </button>
            <button className="map-popup-button">View Show</button>
            <button className="map-popup-nav-button" onClick={handleNext}>
              →
            </button>
          </div>
          {concerts.length > 1 && (
            <div className="map-popup-counter">
              Show {currentIndex + 1} of {concerts.length}
            </div>
          )}
        </>

      ) : (<button className="map-popup-button">View Show</button>)}
    </div>
  )
}

export default MapsMarkerPopup