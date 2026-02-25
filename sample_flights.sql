INSERT INTO flights (flight_number, airline, departure_city, arrival_city, departure_time, arrival_time, price, total_seats, available_seats) VALUES
('AA-101', 'American Airlines', 'New York', 'London', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 450.00, 150, 150),
('IN-202', 'IndiGo', 'Mumbai', 'Delhi', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 120.00, 180, 180),
('EK-303', 'Emirates', 'Dubai', 'Paris', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 600.00, 200, 200),
('SJ-404', 'SpiceJet', 'Delhi', 'Goa', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 80.00, 120, 120),
('BA-505', 'British Airways', 'London', 'Berlin', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 250.00, 180, 180),
('QF-606', 'Qantas', 'Sydney', 'Melbourne', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 100.00, 140, 140);
