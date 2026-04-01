import './MapsMarkerPopup.css'

function MapsMarkerPopup({ concert }) {
  return (
    <div className="map-popup-card">
      <img
        src={concert.image}
        alt={concert.artist}
        className="map-popup-image"
      />

      <p className="map-popup-date">{concert.date}</p>

      <h3 className="map-popup-artist">{concert.artist}</h3>

      <p className="map-popup-venue">{concert.venue}</p>

      <div className="map-popup-rating-row">
        <span className="map-popup-stars">
          {'★'.repeat(concert.rating)}
          {'☆'.repeat(5 - concert.rating)}
        </span>
        <span className="map-popup-rating">{concert.rating}.0</span>
      </div>

      <button className="map-popup-button">View Show</button>
    </div>
  )
}

export default MapsMarkerPopup