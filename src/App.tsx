import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Trade from './pages/Trade';
import Loans from './pages/Loans';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Trade />} />
          <Route path="/loans" element={<Loans />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
