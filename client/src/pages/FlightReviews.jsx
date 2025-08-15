import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Reviews.css';

const FlightReviews = () => {
  const { flightID } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [score, setScore] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Fetch reviews
    fetch(`/api/flights/${flightID}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data.reviews))
      .catch(err => console.error('❌ Failed to load reviews:', err));

    // Check login status
    fetch('/api/users/check-auth', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setIsLoggedIn(data.authenticated))
      .catch(() => setIsLoggedIn(false));
  }, [flightID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`/api/flights/${flightID}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment: commentText, score }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setCommentText('');
        setScore('');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (err) {
      console.error('❌ Submit error:', err);
    }
  };

  return (
    <div className="reviews-container">
      <h1>📝 Reviews for Flight: {flightID}</h1>

      {reviews && reviews.length > 0 ? (
        <table className="review-table">
          <thead>
            <tr>
              <th>Comment</th>
              <th>Score</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r, i) => (
              <tr key={i}>
                <td>{r.CommentText}</td>
                <td>{r.Score}</td>
                <td>{new Date(r.CreatedAt).toISOString().split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-reviews">No reviews yet. Be the first to leave a review!</p>
      )}

      <div className="review-form-section">
        {isLoggedIn ? (
          <>
            <h2>🖊️ Leave a Review</h2>
            <form onSubmit={handleSubmit} className="review-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                rows={4}
                required
              />
              <br />
              <label htmlFor="score">Score (1–5): </label>
              <select
                id="score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
              >
                <option value="">Select Score</option>
                <option value="1">1 - Terrible</option>
                <option value="2">2 - Bad</option>
                <option value="3">3 - Okay</option>
                <option value="4">4 - Good</option>
                <option value="5">5 - Excellent</option>
              </select>
              <br />
              <button type="submit" className='submit-button'>Submit Review</button>
            </form>
          </>
        ) : (
          <p className="login-warning">
            🔒 You must <a href="/login">log in</a> to leave a review.
          </p>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => navigate('/')} className="back-button">🔙 Back to Home</button>
      </div>
    </div>
  );
};

export default FlightReviews;
