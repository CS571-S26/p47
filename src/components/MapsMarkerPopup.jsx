import './MapsMarkerPopup.css'

function MapsMarkerPopup({ concert }) {
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

      <button className="map-popup-button">View Show</button>
    </div>
  )
}

export default MapsMarkerPopup