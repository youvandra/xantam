import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Trade from './pages/Trade';
import Loans from './pages/Loans';
import Discover from './pages/Discover';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Trade />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/discover" element={<Discover />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
