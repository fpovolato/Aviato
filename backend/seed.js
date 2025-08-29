const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Airline = require('./models/Airline');
const Airport = require('./models/Airport');
const Plane = require('./models/Plane');
const Route = require('./models/Route');
const Flight = require('./models/Flight');
const connectDB = require('./config/db');

// Mock data generators
const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const mockNames = [
  'Mario', 'Luigi', 'Francesco', 'Giuseppe', 'Antonio', 'Luca', 'Marco', 'Andrea', 'Alessandro', 'Lorenzo',
  'Giulia', 'Francesca', 'Chiara', 'Sara', 'Anna', 'Elena', 'Valentina', 'Martina', 'Alessia', 'Giorgia'
];

const mockSurnames = [
  'Rossi', 'Bianchi', 'Ferrari', 'Russo', 'Romano', 'Gallo', 'Costa', 'Fontana', 'Conti', 'Greco',
  'Moretti', 'Bruno', 'Galli', 'De Luca', 'Mancini', 'Ricci', 'Lombardi', 'Barbieri', 'Colombo', 'Benedetti'
];

const mockAirlines = [
  { name: 'Aviato Airlines', code: 'AV' },
  { name: 'ItalWings', code: 'IW' },
  { name: 'SkyItalia', code: 'SI' },
  { name: 'Mediterranean Air', code: 'MA' },
  { name: 'Alpine Airways', code: 'AA' }
];

const mockPlanes = [
  { manifacturer: 'Airbus', model: 'A320' },
  { manifacturer: 'Boeing', model: '737-800' },
  { manifacturer: 'Airbus', model: 'A330' },
  { manifacturer: 'Boeing', model: '787' },
  { manifacturer: 'Airbus', model: 'A350' },
  { manifacturer: 'Boeing', model: '777' },
  { manifacturer: 'Embraer', model: 'E190' },
  { manifacturer: 'Bombardier', model: 'CRJ-900' },
  { manifacturer: 'ATR', model: '72-600' },
  { manifacturer: 'Airbus', model: 'A220' }
];

// Seeding functions
const seedAdmin = async () => {
  console.log('Creating admin user...');
  
  const adminData = {
    name: 'Admin',
    surname: 'System',
    email: 'admin@aviato.com',
    password: 'password',
    roles: ['admin'],
    birthDate: new Date('1980-01-01')
  };
  
  const admin = await User.create(adminData);
  console.log(`Admin created: ${admin.email}`);
  return admin;
};

const seedManagersAndAirlines = async () => {
  console.log('Creating managers and airlines...');
  
  const managers = [];
  const airlines = [];
  
  for (let i = 0; i < 5; i++) {
    const airlineData = mockAirlines[i];
    
    // Create airline first
    const airline = await Airline.create({
      name: airlineData.name,
      code: airlineData.code
    });
    airlines.push(airline);
    
    // Create manager for this airline
    const managerData = {
      name: getRandomElement(mockNames),
      surname: getRandomElement(mockSurnames),
      email: `manager${i + 1}@${airlineData.code.toLowerCase()}.com`,
      password: 'password',
      roles: ['manager'],
      birthDate: generateRandomDate(new Date('1970-01-01'), new Date('1990-12-31')),
      airlines: [airline._id]
    };
    
    const manager = await User.create(managerData);
    managers.push(manager);
    
    // Update airline with manager
    airline.manager = manager._id;
    await airline.save();
    
    console.log(`Created airline: ${airline.name} (${airline.code}) with manager: ${manager.email}`);
  }
  
  return { managers, airlines };
};

const seedEmployees = async (airlines) => {
  console.log('Creating employees...');
  
  const employees = [];
  
  for (const airline of airlines) {
    for (let i = 0; i < 2; i++) {
      const employeeData = {
        name: getRandomElement(mockNames),
        surname: getRandomElement(mockSurnames),
        email: `employee${employees.length + 1}@${airline.code.toLowerCase()}.com`,
        password: 'password',
        roles: ['employee'],
        birthDate: generateRandomDate(new Date('1980-01-01'), new Date('2000-12-31')),
        airlines: [airline._id]
      };
      
      const employee = await User.create(employeeData);
      employees.push(employee);
      
      console.log(`Created employee: ${employee.email} for ${airline.name}`);
    }
  }
  
  return employees;
};

const seedCustomers = async () => {
  console.log('Creating customer users...');
  
  const customers = [];
  
  for (let i = 0; i < 10; i++) {
    const customerData = {
      name: getRandomElement(mockNames),
      surname: getRandomElement(mockSurnames),
      email: `customer${i + 1}@gmail.com`,
      password: 'password',
      roles: ['customer'],
      birthDate: generateRandomDate(new Date('1960-01-01'), new Date('2005-12-31'))
    };
    
    const customer = await User.create(customerData);
    customers.push(customer);
    
    console.log(`Created customer: ${customer.email}`);
  }
  
  return customers;
};

const importAirportsFromCSV = async () => {
  console.log('Importing airports from CSV...');
  
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.resolve('./Dump/airports.csv');
    
    if (!fs.existsSync(filePath)) {
      console.log('CSV file not found, skipping airport import');
      resolve([]);
      return;
    }
    
    fs.createReadStream(filePath)
      .pipe(csv({
        headers: [
          'airportId', 'name', 'city', 'country', 'iata', 'icao',
          'latitude', 'longitude', 'altitude', 'timezone', 'dst',
          'tzDatabaseTimezone', 'type', 'source'
        ],
        skipLines: 0
      }))
      .on('data', (row) => {
        row.airportId = Number(row.airportId);
        row.latitude = parseFloat(row.latitude);
        row.longitude = parseFloat(row.longitude);
        row.altitude = Number(row.altitude);
        row.timezone = parseFloat(row.timezone);
        
        if (!row.iata) row.iata = null;
        if (!row.icao) row.icao = null;
        
        results.push(row);
      })
      .on('end', async () => {
        try {
          // Take only first 50 airports to avoid overwhelming the database
          const limitedResults = results.slice(0, 50);
          const inserted = await Airport.insertMany(limitedResults, { ordered: false });
          console.log(`Imported ${inserted.length} airports`);
          resolve(inserted);
        } catch (error) {
          console.error('Error importing airports:', error.message);
          resolve([]);
        }
      })
      .on('error', (err) => {
        console.error('CSV parse error:', err);
        resolve([]);
      });
  });
};

const seedPlanes = async (airlines) => {
  console.log('Creating planes...');
  
  const planes = [];
  
  for (let i = 0; i < 10; i++) {
    const airline = getRandomElement(airlines);
    const planeModel = getRandomElement(mockPlanes);
    
    const planeData = {
      code: `${airline.code}${String(i + 1).padStart(3, '0')}`,
      manifacturer: planeModel.manifacturer,
      model: planeModel.model,
      airline: airline._id,
      seats: 180,
      totalRows: 30,
      maxSeatsPerRow: 6,
      cabinConfiguration: [
        {
          name: 'First Class',
          seatClass: 'first',
          startRow: '1',
          endRow: '5',
          seatsPerRow: 4,
          seatLayout: '2-2',
          priceMultiplier: 3.0
        },
        {
          name: 'Economy Class',
          seatClass: 'economy',
          startRow: '6',
          endRow: '30',
          seatsPerRow: 6,
          seatLayout: '3-3',
          priceMultiplier: 1.0
        }
      ],
      hasWiFi: Math.random() > 0.5,
      hasEntertainment: Math.random() > 0.3,
      hasPowerOutlets: Math.random() > 0.4
    };
    
    const plane = await Plane.create(planeData);
    planes.push(plane);
    
    console.log(`Created plane: ${plane.code} (${plane.manifacturer} ${plane.model}) for ${airline.name}`);
  }
  
  return planes;
};

const seedRoutes = async (airports) => {
  console.log('Creating routes...');
  
  if (airports.length < 2) {
    console.log('Not enough airports to create routes');
    return [];
  }
  
  const routes = [];
  
  for (let i = 0; i < 10; i++) {
    let departureAirport, arrivalAirport;
    
    // Ensure different airports
    do {
      departureAirport = getRandomElement(airports);
      arrivalAirport = getRandomElement(airports);
    } while (departureAirport._id.toString() === arrivalAirport._id.toString());
    
    const routeCode = `${departureAirport.iata || 'XXX'}${arrivalAirport.iata || 'YYY'}${String(i + 1).padStart(2, '0')}`;
    
    const routeData = {
      departureAirport: departureAirport._id,
      arrivalAirport: arrivalAirport._id,
      code: routeCode
    };
    
    try {
      const route = await Route.create(routeData);
      routes.push(route);
      
      console.log(`Created route: ${routeCode} (${departureAirport.name} → ${arrivalAirport.name})`);
    } catch (error) {
      console.log(`Skipped duplicate route: ${routeCode}`);
    }
  }
  
  return routes;
};

const seedFlights = async (routes, planes, airlines) => {
  console.log('Creating flights...');
  
  if (routes.length === 0 || planes.length === 0) {
    console.log('Not enough routes or planes to create flights');
    return [];
  }
  
  const flights = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const route = getRandomElement(routes);
    const plane = getRandomElement(planes);
    const airline = getRandomElement(airlines);
    
    // Generate departure time between now and 3 months from now
    const departureDate = generateRandomDate(now, new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000));
    
    // Flight duration between 1-8 hours
    const flightDurationHours = 1 + Math.random() * 7;
    const arrivalDate = new Date(departureDate.getTime() + flightDurationHours * 60 * 60 * 1000);
    
    const basePrice = 100 + Math.random() * 500;
    const firstClassPrice = basePrice * (2 + Math.random() * 2);
    
    const flightData = {
      flightNumber: `${airline.code}${String(i + 1).padStart(4, '0')}`,
      route: route._id,
      departureDate,
      arrivalDate,
      airline: airline._id,
      plane: plane._id,
      status: getRandomElement(['scheduled', 'delayed']),
      price: Math.round(basePrice),
      firstClassPrice: Math.round(firstClassPrice),
      additionalLuggagePrice: Math.round(20 + Math.random() * 30),
      seatsAvailable: Math.floor(plane.seats * (0.7 + Math.random() * 0.3))
    };
    
    try {
      const flight = await Flight.create(flightData);
      flights.push(flight);
      
      console.log(`Created flight: ${flight.flightNumber} on ${departureDate.toDateString()}`);
    } catch (error) {
      console.log(`Skipped duplicate flight: ${flightData.flightNumber}`);
    }
  }
  
  return flights;
};

const main = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Airline.deleteMany({}),
      Airport.deleteMany({}),
      Plane.deleteMany({}),
      Route.deleteMany({}),
      Flight.deleteMany({})
    ]);
    
    // Seed data in order
    const admin = await seedAdmin();
    
    const { managers, airlines } = await seedManagersAndAirlines();
    
    const employees = await seedEmployees(airlines);
    
    const customers = await seedCustomers();
    
    const airports = await importAirportsFromCSV();
    
    const planes = await seedPlanes(airlines);
    
    const routes = await seedRoutes(airports);
    
    const flights = await seedFlights(routes, planes, airlines);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin users: 1`);
    console.log(`- Airlines: ${airlines.length}`);
    console.log(`- Manager users: ${managers.length}`);
    console.log(`- Employee users: ${employees.length}`);
    console.log(`- Customer users: ${customers.length}`);
    console.log(`- Airports: ${airports.length}`);
    console.log(`- Planes: ${planes.length}`);
    console.log(`- Routes: ${routes.length}`);
    console.log(`- Flights: ${flights.length}`);
    
    console.log('\n🔑 Default credentials:');
    console.log('Admin: admin@aviato.com / password');
    console.log('Managers: manager1@av.com / password (and similar for other airlines)');
    console.log('Employees: employee1@av.com / password (and similar)');
    console.log('Customers: customer1@gmail.com / password (and similar)');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Seeding interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Seeding terminated');
  process.exit(1);
});

main();