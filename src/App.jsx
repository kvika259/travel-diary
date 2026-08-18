import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TravelProvider } from './context/TravelContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CountryList from './components/CountryList';
import CountryView from './components/CountryView';
import CityView from './components/CityView';
import TripTree from './components/TripTree';
import TripForm from './components/TripForm';
import TripView from './components/TripView';
import WorldMap from './components/WorldMap';
import Settings from './components/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TravelProvider>
          <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<PrivateRoute><CountryList /></PrivateRoute>} />
              <Route path="/country/:countryId" element={<PrivateRoute><CountryView /></PrivateRoute>} />
              <Route path="/country/:countryId/city/:cityId" element={<PrivateRoute><CityView /></PrivateRoute>} />
              <Route path="/travels" element={<PrivateRoute><TripTree /></PrivateRoute>} />
              <Route path="/map" element={<PrivateRoute><WorldMap /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/trip/new" element={<PrivateRoute><TripForm /></PrivateRoute>} />
              <Route path="/trip/new/:cityId?/:countryId?" element={<PrivateRoute><TripForm /></PrivateRoute>} />
              <Route path="/trip/:tripId" element={<PrivateRoute><TripView /></PrivateRoute>} />
            </Route>
          </Routes>
          </ErrorBoundary>
        </TravelProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}