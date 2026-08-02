import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiMessageSquare } from 'react-icons/fi';
import StarRating from '../components/StarRating';
import '../styles/Reviews.css';

const FlightReviews = () => {
  const { flightID } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [score, setScore] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch(`/api/flights/${flightID}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data.reviews))
      .catch(err => console.error('❌ Failed to load reviews:', err));

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

  const avg = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + Number(r.Score), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="sl-page">
      <div className="sl-page-head">
        <div>
          <h1 className="sl-page-title">Reviews for {flightID}</h1>
          <p className="sl-page-sub">{reviews.length} verified review{reviews.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="sl-card sl-review-summary">
          <div className="sl-review-score">
            <p className="mono sl-review-avg">{avg}</p>
            <StarRating rating={Math.round(Number(avg))} size={18} />
            <p className="sl-muted sl-small">{reviews.length} reviews</p>
          </div>
        </div>
      )}

      <div className="sl-card">
        <div className="sl-card-head">
          <h2 className="sl-card-title">All Reviews</h2>
        </div>
        {reviews && reviews.length > 0 ? (
          <div className="sl-review-list">
            {reviews.map((r, i) => (
              <div key={i} className="sl-review-item">
                <div className="sl-review-item-head">
                  <StarRating rating={Number(r.Score)} size={13} />
                  <span className="sl-muted sl-small mono">
                    <FiClock size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
                    {new Date(r.CreatedAt).toISOString().split('T')[0]}
                  </span>
                </div>
                <p className="sl-review-comment">"{r.CommentText}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="sl-empty-state">
            <FiMessageSquare size={24} />
            <p className="sl-strong">No reviews yet</p>
            <p className="sl-small">Be the first to leave a review!</p>
          </div>
        )}
      </div>

      <div className="sl-card" style={{ padding: 20 }}>
        {isLoggedIn ? (
          <>
            <h2 className="sl-card-title" style={{ marginBottom: 12 }}>Leave a Review</h2>
            <form onSubmit={handleSubmit} className="sl-review-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                rows={4}
                required
                className="sl-input"
                style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
              />
              <div className="sl-field">
                <label className="sl-label" htmlFor="score">Score (1–5)</label>
                <select
                  id="score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                  className="sl-input"
                >
                  <option value="">Select score</option>
                  <option value="1">1 - Terrible</option>
                  <option value="2">2 - Bad</option>
                  <option value="3">3 - Okay</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              <button type="submit" className="sl-btn-primary">Submit Review</button>
            </form>
          </>
        ) : (
          <p className="sl-muted sl-small">
            You must <Link to="/login" className="sl-link">log in</Link> to leave a review.
          </p>
        )}
      </div>

      <button onClick={() => navigate('/')} className="sl-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
        <FiArrowLeft size={13} /> Back to Home
      </button>
    </div>
  );
};

export default FlightReviews;