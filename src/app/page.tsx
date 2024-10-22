import Link from "next/link"
import './mainpage.css';

export default function mainpage() {
  return (
    <div className="mainpage-container">
      <header className="mainpage-header">
        <div className="mainpage-header-content">
          <div>
            <h1 className="mainpage-title">Travel Planner</h1>
            <p className="mainpage-subtitle">Plan your dream vacation with ease</p>
          </div>
          <nav>
            <ul className="mainpage-nav">
              <li>
                <Link href="#" prefetch={false} className="mainpage-link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="Explore" prefetch={false} className="mainpage-link">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="create_plan" prefetch={false} className="mainpage-link">
                  Create
                </Link>
              </li>
              <li>
                <Link href="#" prefetch={false} className="mainpage-link">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <section className="mainpage-section">
          <div className="mainpage-section-content">
            <h2 className="mainpage-section-title">Popular Travel Plans</h2>
            <div className="mainpage-grid">
              <Link href="#" prefetch={false} className="mainpage-card">
                <img
                  src="/placeholder.svg"
                  alt="Travel Plan Thumbnail"
                  className="mainpage-thumbnail"
                />
                <div className="mainpage-card-content">
                  <h3 className="mainpage-card-title">Romantic Getaway in Paris</h3>
                  <p className="mainpage-card-text">Explore the city of love with your significant other.</p>
                </div>
              </Link>
              <Link href="#" prefetch={false} className="mainpage-card">
                <img
                  src="/placeholder.svg"
                  alt="Travel Plan Thumbnail"
                  className="mainpage-thumbnail"
                />
                <div className="mainpage-card-content">
                  <h3 className="mainpage-card-title">Family Adventure in the Alps</h3>
                  <p className="mainpage-card-text">Discover the beauty of the Swiss Alps with your loved ones.</p>
                </div>
              </Link>
              <Link href="#" prefetch={false} className="mainpage-card">
                <img
                  src="/placeholder.svg"
                  alt="Travel Plan Thumbnail"
                  className="mainpage-thumbnail"
                />
                <div className="mainpage-card-content">
                  <h3 className="mainpage-card-title">Backpacking through Southeast Asia</h3>
                  <p className="mainpage-card-text">Immerse yourself in the vibrant cultures of Thailand, Vietnam, and more.</p>
                </div>
              </Link>
              <Link href="#" prefetch={false} className="mainpage-card">
                <img
                  src="/placeholder.svg"
                  alt="Travel Plan Thumbnail"
                  className="mainpage-thumbnail"
                />
                <div className="mainpage-card-content">
                  <h3 className="mainpage-card-title">Coastal Road Trip in California</h3>
                  <p className="mainpage-card-text">Explore the stunning Pacific Coast Highway from San Francisco to Los Angeles.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="mainpage-footer">
        <div className="mainpage-footer-content">
          <div>
            <h3 className="mainpage-footer-title">About Travel Planner</h3>
            <p className="mainpage-footer-text">Travel Planner is a platform that helps you create and share your dream vacation plans. Discover inspiring travel itineraries and get started on your next adventure.</p>
          </div>
          <div className="mainpage-contact">
            <h3 className="mainpage-footer-title">Contact Us</h3>
            <p className="mainpage-footer-text">
              Email: info@travelplanner.com
              <br />
              Phone: +1 (123) 456-7890
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
