# Uni-Way

A modern ride-sharing mobile application built with React Native for university students and drivers.

## Overview

Uni-Way connects university students with drivers for convenient, affordable transportation. The app provides separate interfaces for both passengers and drivers, with real-time location tracking and ride management.

## Features

- **Dual User Interfaces**: Separate experiences for passengers and drivers
- **Real-time Location Tracking**: Track driver location and ride progress
- **Ride Requests**: Drivers can view and accept ride requests
- **ETA Countdown**: Real-time countdown for pickup and destination arrival
- **Ride History**: View past rides and frequent destinations
- **Driver Rating System**: Provide feedback on drivers after trips

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or later)
- npm or yarn
- Expo CLI
- Git

## Getting Started

### Access Via Expo Account (Recommended)

This project is already configured in Expo. To access it:

```bash
# Install Expo CLI globally if you haven't already
npm install -g expo-cli

# Login to Expo using the credentials provided
npx expo login

# When prompted, enter:
# Username: [provided username]
# Password: [provided password]

# View available projects
npx expo projects

# Open the Uni-Way project
expo open uni-way
```

### Alternative: Local Setup

If you prefer to set up the project locally:

```bash
# Clone the repository
git clone https://github.com/your-username/uni-way.git

# Navigate to the project directory
cd uni-way

# Install dependencies
npm install
# or
yarn install

# Start the development server
npx expo start
```

## Running the App

After starting the development server:

1. Install the Expo Go app on your iOS or Android device
2. Scan the QR code from the terminal or Expo Developer Tools
3. The app will load on your device

You can also run on simulators:
```bash
# For iOS
npx expo start --ios

# For Android
npx expo start --android
```

## Demo Accounts

Use these credentials to test the application:

**Driver Account:**
- Email: driver@uniway.com
- Password: driver123

**Passenger Account:**
- Email: sarah@uniway.com
- Password: sarah123
- Or create your own using the signup feature

## Project Structure

```
uni-way/
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Screen components
│ │ ├── Home.tsx # Home screen for passengers
│ │ ├── Login.tsx # Authentication screen
│ │ ├── DriverHome.tsx # Home screen for drivers
│ │ └── ...
│ ├── data/ # Mock data
│ │ └── driverData.json # Demo driver accounts
│ └── utils/ # Utility functions
│ └── authStorage.ts # Authentication utilities
├── App.tsx # Main application component
└── README.md # Project documentation


## Testing Flow

1. **Login as a Driver**:
   - Use the "Demo Driver" button on login screen
   - Toggle online status to receive ride requests
   - Accept or decline ride requests
   - Complete rides with the countdown system

2. **Login as a Passenger**:
   - Book a ride by selecting a destination
   - Track driver's location and ETA
   - Rate driver after ride completion

## Expo Commands Reference

```bash
# Login to Expo
expo login

# Logout of Expo
expo logout

# View all projects
expo projects

# Publish a project update
expo publish

# Build for app stores
expo build:ios
expo build:android

# View build status
expo build:status

# Clear cache if experiencing issues
expo start -c
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Navigation](https://reactnavigation.org/)