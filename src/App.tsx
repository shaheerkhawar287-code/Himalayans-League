import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Players } from './pages/Players';
import { Registration } from './pages/Registration';
import { Stats } from './pages/Stats';
import { Matches } from './pages/Matches';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/players" element={<Players />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
