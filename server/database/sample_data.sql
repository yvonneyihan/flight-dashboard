-- ==========================================
-- sample_data.sql
-- Skylink Sample Data
-- ==========================================

-- Passengers
INSERT INTO Passenger (Name, Email, Password) VALUES
('Alice Smith', 'alice@example.com', '$2b$10$examplehashhashhashhashhash1'),
('Bob Johnson',  'bob@example.com',  '$2b$10$examplehashhashhashhashhash2'),
('Cara Lee',     'cara@example.com', '$2b$10$examplehashhashhashhashhash3');

-- Airports
INSERT INTO Airport (AirportID, Name, City, Country, Latitude, Longitude) VALUES
('ORD', 'Chicago O''Hare International Airport', 'Chicago', 'USA', 41.9742000000, -87.9073000000),
('LAX', 'Los Angeles International Airport',     'Los Angeles', 'USA', 33.9416000000, -118.4085000000),
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 40.6413000000,  -73.7781000000),
('SEA', 'Seattle-Tacoma International Airport',  'Seattle', 'USA', 47.4502000000, -122.3088000000);

-- RealtimeFlight
INSERT INTO RealtimeFlight
(FlightID, ScheduledDeparture, ScheduledArrival, Status, AirlineName,
 DepartureAirportID, ArrivalAirportID, DepartureAirportName, ArrivalAirportName,
 DepartureLatitude, DepartureLongitude, ArrivalLatitude, ArrivalLongitude)
VALUES
('UA123', '2025-08-15 08:00:00', '2025-08-15 11:00:00', 'On Time', 'United Airlines',
 'ORD', 'LAX', 'Chicago O''Hare International Airport', 'Los Angeles International Airport',
 41.9742, -87.9073, 33.9416, -118.4085),

('AA456', '2025-08-15 14:00:00', '2025-08-15 17:30:00', 'Delayed', 'American Airlines',
 'LAX', 'JFK', 'Los Angeles International Airport', 'John F. Kennedy International Airport',
 33.9416, -118.4085, 40.6413, -73.7781),

('DL789', '2025-08-16 09:10:00', '2025-08-16 12:25:00', 'On Time', 'Delta Air Lines',
 'JFK', 'SEA', 'John F. Kennedy International Airport', 'Seattle-Tacoma International Airport',
 40.6413, -73.7781, 47.4502, -122.3088);

-- PopularRoutes
INSERT INTO PopularRoutes (depAirport, arrAirport, searchCount) VALUES
('ORD', 'LAX', 15),
('LAX', 'JFK', 9),
('JFK', 'SEA', 5);

-- SavedSearches
INSERT INTO SavedSearches (userId, searchQuery, depAirport, arrAirport) VALUES
(1, 'ORD to LAX morning flights', 'ORD', 'LAX'),
(2, 'Evening LAX → JFK', 'LAX', 'JFK'),
(3, 'Red-eye JFK to SEA', 'JFK', 'SEA');

-- ManualFlights
INSERT INTO ManualFlights
(userId, flightID, departure, arrival, airline, depAirport, arrAirport, note)
VALUES
(1, 'UA200', '2025-08-20 07:45:00', '2025-08-20 10:55:00', 'United Airlines', 'ORD', 'LAX', 'Client meeting in LA'),
(2, 'AA300', '2025-09-01 13:20:00', '2025-09-01 21:30:00', 'American Airlines', 'LAX', 'JFK', 'Vacation to NYC'),
(3, 'DL410', '2025-09-05 22:10:00', '2025-09-06 01:15:00', 'Delta Air Lines', 'JFK', 'SEA', 'Red-eye to Seattle');

-- Reviews
INSERT INTO Review (PassengerID, FlightID, CommentText, Score) VALUES
(1, 'UA123', 'Smooth flight, friendly crew.', 5),
(2, 'AA456', 'Delay was long but staff handled it well.', 4),
(3, 'DL789', 'On time and comfortable.', 5);

-- ReviewVotes
INSERT INTO ReviewVotes (FlightID, VoteType, UserId) VALUES
('UA123', 'like',    2),
('AA456', 'dislike', 1),
('DL789', 'like',    1),
('UA123', 'like',    3);
