
-- =============================
-- SkyLink Database Schema
-- =============================
-- Description: Schema for SkyLink flight search app with simulated data
-- =============================

--
-- Table structure for table `Airport`
--
DROP TABLE IF EXISTS `Airport`;

CREATE TABLE `Airport` (
  `AirportID` varchar(10) NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `Latitude` decimal(15,10) DEFAULT NULL,
  `Longitude` decimal(15,10) DEFAULT NULL,
  PRIMARY KEY (`AirportID`),
  KEY `idx_airport_name` (`Name`),
  KEY `idx_airport_airportid_name` (`AirportID`,`Name`),
  CONSTRAINT `chk_airport_latitude` CHECK ((`Latitude` between -(90) and 90)),
  CONSTRAINT `chk_airport_longitude` CHECK ((`Longitude` between -(180) and 180)),
  CONSTRAINT `chk_airportid_length` CHECK ((char_length(`AirportID`) <= 10)),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `ManualFlights`
--

DROP TABLE IF EXISTS `ManualFlights`;

CREATE TABLE `ManualFlights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `flightID` varchar(20) DEFAULT NULL,
  `departure` datetime DEFAULT NULL,
  `arrival` datetime DEFAULT NULL,
  `airline` varchar(100) DEFAULT NULL,
  `depAirport` varchar(100) DEFAULT NULL,
  `arrAirport` varchar(100) DEFAULT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `ManualFlights_ibfk_1` (`userId`),
  CONSTRAINT `ManualFlights_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Passenger` (`PassengerID`),
  CONSTRAINT `chk_manual_arrairport_len` CHECK (((`arrAirport` is null) or (char_length(`arrAirport`) = 3))),
  CONSTRAINT `chk_manual_dep_before_arr` CHECK ((`departure` < `arrival`)),
  CONSTRAINT `chk_manual_depairport_len` CHECK (((`depAirport` is null) or (char_length(`depAirport`) = 3)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `Passenger`
--

DROP TABLE IF EXISTS `Passenger`;

CREATE TABLE `Passenger` (
  `Name` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Password` varchar(255) NOT NULL DEFAULT '',
  `PassengerID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`PassengerID`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `Email_2` (`Email`),
  CONSTRAINT `chk_passenger_email_format` CHECK (((`Email` is null) or regexp_like(`Email`,_utf8mb4'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `PopularRoutes`
--

DROP TABLE IF EXISTS `PopularRoutes`;

CREATE TABLE `PopularRoutes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `depAirport` varchar(10) DEFAULT NULL,
  `arrAirport` varchar(10) DEFAULT NULL,
  `searchCount` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_route` (`depAirport`,`arrAirport`),
  CONSTRAINT `chk_poproutes_airport_len` CHECK (((`depAirport` is null) or (char_length(`depAirport`) <= 10))),
  CONSTRAINT `chk_poproutes_arr_airport_len` CHECK (((`arrAirport` is null) or (char_length(`arrAirport`) <= 10))),
  CONSTRAINT `chk_poproutes_searchcount_nonneg` CHECK ((`searchCount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `RealtimeFlight`
--

DROP TABLE IF EXISTS `RealtimeFlight`;

CREATE TABLE `RealtimeFlight` (
  `id` int NOT NULL AUTO_INCREMENT,
  `FlightID` varchar(30) DEFAULT NULL,
  `ScheduledDeparture` datetime DEFAULT NULL,
  `ScheduledArrival` datetime DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `AirlineName` varchar(100) DEFAULT NULL,
  `DepartureAirportID` varchar(10) DEFAULT NULL,
  `ArrivalAirportID` varchar(10) DEFAULT NULL,
  `DepartureAirportName` varchar(100) DEFAULT NULL,
  `ArrivalAirportName` varchar(100) DEFAULT NULL,
  `DepartureLatitude` double DEFAULT NULL,
  `DepartureLongitude` double DEFAULT NULL,
  `ArrivalLatitude` double DEFAULT NULL,
  `ArrivalLongitude` double DEFAULT NULL,
  `LastUpdated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `Review`
--

DROP TABLE IF EXISTS `Review`;

CREATE TABLE `Review` (
  `ReviewID` int NOT NULL AUTO_INCREMENT,
  `PassengerID` int NOT NULL,
  `FlightID` varchar(50) DEFAULT NULL,
  `CommentText` text NOT NULL,
  `Score` int DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReviewID`),
  UNIQUE KEY `unique_review_per_passenger_flight` (`PassengerID`,`FlightID`),
  KEY `FlightID` (`FlightID`),
  CONSTRAINT `Review_ibfk_1` FOREIGN KEY (`PassengerID`) REFERENCES `Passenger` (`PassengerID`),
  CONSTRAINT `chk_review_commenttext_not_empty` CHECK ((char_length(`CommentText`) > 0)),
  CONSTRAINT `Review_chk_1` CHECK ((`Score` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `ReviewVotes`
--

DROP TABLE IF EXISTS `ReviewVotes`;

CREATE TABLE `ReviewVotes` (
  `ReviewID` int NOT NULL AUTO_INCREMENT,
  `FlightID` varchar(10) NOT NULL,
  `VoteType` enum('like','dislike') NOT NULL,
  `UserId` int DEFAULT NULL,
  PRIMARY KEY (`ReviewID`),
  UNIQUE KEY `unique_vote` (`ReviewID`,`FlightID`,`UserId`),
  UNIQUE KEY `uniq_flight_vote` (`FlightID`,`UserId`),
  KEY `fk_passenger` (`UserId`),
  CONSTRAINT `fk_passenger` FOREIGN KEY (`UserId`) REFERENCES `Passenger` (`PassengerID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `SavedSearches`
--

DROP TABLE IF EXISTS `SavedSearches`;

CREATE TABLE `SavedSearches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `searchQuery` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `depAirport` varchar(10) DEFAULT NULL,
  `arrAirport` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `SavedSearches_ibfk_1` (`userId`),
  CONSTRAINT `SavedSearches_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Passenger` (`PassengerID`),
  CONSTRAINT `chk_savedsearches_arrA_len` CHECK (((`arrAirport` is null) or (char_length(`arrAirport`) <= 10))),
  CONSTRAINT `chk_savedsearches_depA_len` CHECK (((`depAirport` is null) or (char_length(`depAirport`) <= 10))),
  CONSTRAINT `chk_savedsearches_query_nonempty` CHECK (((`searchQuery` is not null) and (char_length(`searchQuery`) > 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

