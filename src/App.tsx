import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Trade from './pages/Trade';
import Loans from './pages/Loans';
import Claim from './pages/Claim';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Trade />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/claim" element={<Claim />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;
