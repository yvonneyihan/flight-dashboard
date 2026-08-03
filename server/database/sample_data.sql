-- ==========================================
-- sample_data.sql
-- Skylink Sample Data
-- ==========================================

-- Passengers
INSERT INTO Passenger (Name, Email, Password) VALUES
('Alice Smith', 'alice@example.com', '$2b$10$examplehashhashhashhashhash1'),
('Bob Johnson',  'bob@example.com',  '$2b$10$examplehashhashhashhashhash2'),
('Cara Lee',     'cara@example.com', '$2b$10$examplehashhashhashhashhash3');

-- Airlines
INSERT INTO Airline (Code, Name) VALUES
('AA', 'American Airlines'),
('UA', 'United Airlines'),
('DL', 'Delta Air Lines'),
('WN', 'Southwest Airlines'),
('AS', 'Alaska Airlines'),
('B6', 'JetBlue Airways'),
('NK', 'Spirit Airlines'),
('F9', 'Frontier Airlines'),
('HA', 'Hawaiian Airlines'),
('AC', 'Air Canada'),
('BA', 'British Airways'),
('AF', 'Air France'),
('LH', 'Lufthansa'),
('KL', 'KLM Royal Dutch Airlines'),
('IB', 'Iberia'),
('LX', 'Swiss International Air Lines'),
('AZ', 'ITA Airways'),
('TP', 'TAP Air Portugal'),
('FI', 'Icelandair'),
('EI', 'Aer Lingus'),
('TK', 'Turkish Airlines'),
('EK', 'Emirates'),
('QR', 'Qatar Airways'),
('EY', 'Etihad Airways'),
('SQ', 'Singapore Airlines'),
('CX', 'Cathay Pacific'),
('JL', 'Japan Airlines'),
('NH', 'All Nippon Airways'),
('KE', 'Korean Air'),
('QF', 'Qantas'),
('AM', 'Aeromexico'),
('LA', 'LATAM Airlines'),
('CM', 'Copa Airlines'),
('AI', 'Air India');

-- Airports
INSERT INTO Airport (AirportID, Name, City, Country, Latitude, Longitude) VALUES
('ORD', 'Chicago O''Hare International Airport', 'Chicago', 'USA', 41.9742000000, -87.9073000000),
('LAX', 'Los Angeles International Airport',     'Los Angeles', 'USA', 33.9416000000, -118.4085000000),
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 40.6413000000,  -73.7781000000),
('SEA', 'Seattle-Tacoma International Airport',  'Seattle', 'USA', 47.4502000000, -122.3088000000),
('ATL', 'Hartsfield-Jackson Atlanta International Airport', 'Atlanta', 'USA', 33.6407000000, -84.4277000000),
('SFO', 'San Francisco International Airport', 'San Francisco', 'USA', 37.6213000000, -122.3790000000),
('DFW', 'Dallas/Fort Worth International Airport', 'Dallas', 'USA', 32.8998000000, -97.0403000000),
('MIA', 'Miami International Airport', 'Miami', 'USA', 25.7959000000, -80.2870000000),
('BOS', 'Logan International Airport', 'Boston', 'USA', 42.3656000000, -71.0096000000),
('DEN', 'Denver International Airport', 'Denver', 'USA', 39.8561000000, -104.6737000000),
('LAS', 'Harry Reid International Airport', 'Las Vegas', 'USA', 36.0840000000, -115.1537000000),
('PHX', 'Phoenix Sky Harbor International Airport', 'Phoenix', 'USA', 33.4373000000, -112.0078000000),
('IAH', 'George Bush Intercontinental Airport', 'Houston', 'USA', 29.9902000000, -95.3368000000),
('MCO', 'Orlando International Airport', 'Orlando', 'USA', 28.4312000000, -81.3081000000);

-- RealtimeFlight
INSERT INTO RealtimeFlight
(FlightID, ScheduledDeparture, ScheduledArrival, Status, AirlineName,
 DepartureAirportID, ArrivalAirportID, DepartureAirportName, ArrivalAirportName,
 DepartureLatitude, DepartureLongitude, ArrivalLatitude, ArrivalLongitude)
VALUES
('UA123', '2026-08-15 08:00:00', '2026-08-15 11:00:00', 'On Time', 'United Airlines',
 'ORD', 'LAX', 'Chicago O''Hare International Airport', 'Los Angeles International Airport',
 41.9742, -87.9073, 33.9416, -118.4085),

('AA456', '2026-08-15 14:00:00', '2026-08-15 17:30:00', 'Delayed', 'American Airlines',
 'LAX', 'JFK', 'Los Angeles International Airport', 'John F. Kennedy International Airport',
 33.9416, -118.4085, 40.6413, -73.7781),

('DL789', '2026-08-16 09:10:00', '2026-08-16 12:25:00', 'On Time', 'Delta Air Lines',
 'JFK', 'SEA', 'John F. Kennedy International Airport', 'Seattle-Tacoma International Airport',
 40.6413, -73.7781, 47.4502, -122.3088),

('WN101', '2026-08-15 06:30:00', '2026-08-15 08:45:00', 'On Time', 'Southwest Airlines',
 'ATL', 'ORD', 'Hartsfield-Jackson Atlanta International Airport', 'Chicago O''Hare International Airport',
 33.6407, -84.4277, 41.9742, -87.9073),

('B6202', '2026-08-15 07:15:00', '2026-08-15 08:35:00', 'On Time', 'JetBlue Airways',
 'JFK', 'BOS', 'John F. Kennedy International Airport', 'Logan International Airport',
 40.6413, -73.7781, 42.3656, -71.0096),

('AS303', '2026-08-15 09:00:00', '2026-08-15 11:45:00', 'Delayed', 'Alaska Airlines',
 'SEA', 'LAX', 'Seattle-Tacoma International Airport', 'Los Angeles International Airport',
 47.4502, -122.3088, 33.9416, -118.4085),

('NK404', '2026-08-15 10:20:00', '2026-08-15 13:10:00', 'On Time', 'Spirit Airlines',
 'LAS', 'DFW', 'Harry Reid International Airport', 'Dallas/Fort Worth International Airport',
 36.0840, -115.1537, 32.8998, -97.0403),

('F9505', '2026-08-15 11:00:00', '2026-08-15 12:30:00', 'Cancelled', 'Frontier Airlines',
 'DEN', 'PHX', 'Denver International Airport', 'Phoenix Sky Harbor International Airport',
 39.8561, -104.6737, 33.4373, -112.0078),

('HA606', '2026-08-15 12:15:00', '2026-08-15 14:50:00', 'On Time', 'Hawaiian Airlines',
 'LAX', 'SEA', 'Los Angeles International Airport', 'Seattle-Tacoma International Airport',
 33.9416, -118.4085, 47.4502, -122.3088),

('AC707', '2026-08-15 13:40:00', '2026-08-15 16:05:00', 'On Time', 'Air Canada',
 'ORD', 'SFO', 'Chicago O''Hare International Airport', 'San Francisco International Airport',
 41.9742, -87.9073, 37.6213, -122.3790),

('BA808', '2026-08-15 15:00:00', '2026-08-15 18:20:00', 'Delayed', 'British Airways',
 'JFK', 'LAX', 'John F. Kennedy International Airport', 'Los Angeles International Airport',
 40.6413, -73.7781, 33.9416, -118.4085),

('UA909', '2026-08-16 06:00:00', '2026-08-16 12:10:00', 'On Time', 'United Airlines',
 'SFO', 'ORD', 'San Francisco International Airport', 'Chicago O''Hare International Airport',
 37.6213, -122.3790, 41.9742, -87.9073),

('AA111', '2026-08-16 07:30:00', '2026-08-16 10:15:00', 'On Time', 'American Airlines',
 'MIA', 'JFK', 'Miami International Airport', 'John F. Kennedy International Airport',
 25.7959, -80.2870, 40.6413, -73.7781),

('DL222', '2026-08-16 08:45:00', '2026-08-16 10:20:00', 'Delayed', 'Delta Air Lines',
 'ATL', 'DFW', 'Hartsfield-Jackson Atlanta International Airport', 'Dallas/Fort Worth International Airport',
 33.6407, -84.4277, 32.8998, -97.0403),

('WN333', '2026-08-16 09:10:00', '2026-08-16 10:35:00', 'On Time', 'Southwest Airlines',
 'DEN', 'LAS', 'Denver International Airport', 'Harry Reid International Airport',
 39.8561, -104.6737, 36.0840, -115.1537),

('B6444', '2026-08-16 10:00:00', '2026-08-16 13:05:00', 'On Time', 'JetBlue Airways',
 'BOS', 'MCO', 'Logan International Airport', 'Orlando International Airport',
 42.3656, -71.0096, 28.4312, -81.3081),

('AS555', '2026-08-16 11:20:00', '2026-08-16 14:10:00', 'On Time', 'Alaska Airlines',
 'SEA', 'PHX', 'Seattle-Tacoma International Airport', 'Phoenix Sky Harbor International Airport',
 47.4502, -122.3088, 33.4373, -112.0078),

('NK666', '2026-08-16 12:40:00', '2026-08-16 14:15:00', 'Delayed', 'Spirit Airlines',
 'IAH', 'LAS', 'George Bush Intercontinental Airport', 'Harry Reid International Airport',
 29.9902, -95.3368, 36.0840, -115.1537),

('F9777', '2026-08-16 13:55:00', '2026-08-16 18:20:00', 'On Time', 'Frontier Airlines',
 'PHX', 'ORD', 'Phoenix Sky Harbor International Airport', 'Chicago O''Hare International Airport',
 33.4373, -112.0078, 41.9742, -87.9073),

('HA888', '2026-08-16 14:30:00', '2026-08-16 17:00:00', 'Cancelled', 'Hawaiian Airlines',
 'SEA', 'LAX', 'Seattle-Tacoma International Airport', 'Los Angeles International Airport',
 47.4502, -122.3088, 33.9416, -118.4085),

('LH123', '2026-08-17 06:15:00', '2026-08-17 09:40:00', 'On Time', 'Lufthansa',
 'JFK', 'LAX', 'John F. Kennedy International Airport', 'Los Angeles International Airport',
 40.6413, -73.7781, 33.9416, -118.4085),

('EK456', '2026-08-17 07:00:00', '2026-08-17 10:30:00', 'On Time', 'Emirates',
 'JFK', 'DFW', 'John F. Kennedy International Airport', 'Dallas/Fort Worth International Airport',
 40.6413, -73.7781, 32.8998, -97.0403),

('QR789', '2026-08-17 08:20:00', '2026-08-17 11:05:00', 'Delayed', 'Qatar Airways',
 'IAH', 'MIA', 'George Bush Intercontinental Airport', 'Miami International Airport',
 29.9902, -95.3368, 25.7959, -80.2870),

('UA212', '2026-08-17 09:45:00', '2026-08-17 11:55:00', 'On Time', 'United Airlines',
 'DEN', 'SEA', 'Denver International Airport', 'Seattle-Tacoma International Airport',
 39.8561, -104.6737, 47.4502, -122.3088),

('AA323', '2026-08-17 10:30:00', '2026-08-17 18:40:00', 'On Time', 'American Airlines',
 'LAX', 'MIA', 'Los Angeles International Airport', 'Miami International Airport',
 33.9416, -118.4085, 25.7959, -80.2870),

('DL434', '2026-08-17 11:15:00', '2026-08-17 19:05:00', 'On Time', 'Delta Air Lines',
 'SFO', 'ATL', 'San Francisco International Airport', 'Hartsfield-Jackson Atlanta International Airport',
 37.6213, -122.3790, 33.6407, -84.4277),

('WN545', '2026-08-17 12:00:00', '2026-08-17 14:10:00', 'Delayed', 'Southwest Airlines',
 'MCO', 'ORD', 'Orlando International Airport', 'Chicago O''Hare International Airport',
 28.4312, -81.3081, 41.9742, -87.9073),

('B6656', '2026-08-17 13:20:00', '2026-08-17 16:35:00', 'On Time', 'JetBlue Airways',
 'BOS', 'LAS', 'Logan International Airport', 'Harry Reid International Airport',
 42.3656, -71.0096, 36.0840, -115.1537),

('AS767', '2026-08-18 06:10:00', '2026-08-18 08:50:00', 'On Time', 'Alaska Airlines',
 'PHX', 'SEA', 'Phoenix Sky Harbor International Airport', 'Seattle-Tacoma International Airport',
 33.4373, -112.0078, 47.4502, -122.3088),

('NK878', '2026-08-18 07:25:00', '2026-08-18 10:55:00', 'On Time', 'Spirit Airlines',
 'LAS', 'IAH', 'Harry Reid International Airport', 'George Bush Intercontinental Airport',
 36.0840, -115.1537, 29.9902, -95.3368),

('F9989', '2026-08-18 08:40:00', '2026-08-18 10:15:00', 'Cancelled', 'Frontier Airlines',
 'ORD', 'DEN', 'Chicago O''Hare International Airport', 'Denver International Airport',
 41.9742, -87.9073, 39.8561, -104.6737),

('HA091', '2026-08-18 09:55:00', '2026-08-18 18:10:00', 'On Time', 'Hawaiian Airlines',
 'LAX', 'JFK', 'Los Angeles International Airport', 'John F. Kennedy International Airport',
 33.9416, -118.4085, 40.6413, -73.7781),

('AC192', '2026-08-18 10:45:00', '2026-08-18 16:50:00', 'On Time', 'Air Canada',
 'SFO', 'ORD', 'San Francisco International Airport', 'Chicago O''Hare International Airport',
 37.6213, -122.3790, 41.9742, -87.9073),

('BA293', '2026-08-18 11:30:00', '2026-08-18 14:20:00', 'On Time', 'British Airways',
 'MIA', 'JFK', 'Miami International Airport', 'John F. Kennedy International Airport',
 25.7959, -80.2870, 40.6413, -73.7781),

('UA394', '2026-08-18 12:15:00', '2026-08-18 14:05:00', 'Delayed', 'United Airlines',
 'ATL', 'DEN', 'Hartsfield-Jackson Atlanta International Airport', 'Denver International Airport',
 33.6407, -84.4277, 39.8561, -104.6737),

('AA495', '2026-08-18 13:00:00', '2026-08-18 14:35:00', 'On Time', 'American Airlines',
 'DFW', 'LAX', 'Dallas/Fort Worth International Airport', 'Los Angeles International Airport',
 32.8998, -97.0403, 33.9416, -118.4085),

('DL596', '2026-08-19 06:20:00', '2026-08-19 14:50:00', 'On Time', 'Delta Air Lines',
 'SEA', 'MCO', 'Seattle-Tacoma International Airport', 'Orlando International Airport',
 47.4502, -122.3088, 28.4312, -81.3081),

('DL650', '2026-08-16 05:30:00', '2026-08-16 08:45:00', 'On Time', 'Delta Air Lines',
 'JFK', 'SEA', 'John F. Kennedy International Airport', 'Seattle-Tacoma International Airport',
 40.6413, -73.7781, 47.4502, -122.3088),

('AA680', '2026-08-16 12:00:00', '2026-08-16 15:20:00', 'Delayed', 'American Airlines',
 'JFK', 'SEA', 'John F. Kennedy International Airport', 'Seattle-Tacoma International Airport',
 40.6413, -73.7781, 47.4502, -122.3088),

('B6710', '2026-08-16 19:15:00', '2026-08-16 22:35:00', 'On Time', 'JetBlue Airways',
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
(2, 'UA123', 'Boarding was quick, in-flight wifi was spotty.', 4),
(3, 'UA123', 'Great legroom and the crew was attentive.', 5),

(2, 'AA456', 'Delay was long but staff handled it well.', 4),
(1, 'AA456', 'The delay threw off my connection, frustrating experience.', 2),
(3, 'AA456', 'Delayed departure but caught up time in the air.', 3),

(3, 'DL789', 'On time and comfortable.', 5),
(1, 'DL789', 'Best Delta flight I have had this year.', 5),
(2, 'DL789', 'Comfortable ride, minor turbulence over the Rockies.', 4),

(1, 'WN101', 'Southwest boarding process was efficient as always.', 4),
(2, 'WN101', 'No assigned seats made it a bit chaotic.', 3),
(3, 'WN101', 'Cheap fare and friendly crew, no complaints.', 5),

(1, 'B6202', 'JetBlue legroom is unbeatable on short hauls.', 5),
(2, 'B6202', 'Free wifi worked great the whole flight.', 4),
(3, 'B6202', 'Quick hop to Boston, no issues at all.', 4);

-- ReviewVotes
INSERT INTO ReviewVotes (FlightID, VoteType, UserId) VALUES
('UA123', 'like',    2),
('AA456', 'dislike', 1),
('DL789', 'like',    1),
('UA123', 'like',    3);
