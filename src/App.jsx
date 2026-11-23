import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReportDetail from './pages/ReportDetail';
import CreateReport from './pages/CreateReport';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main style={{ minHeight: '80vh', maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/reports/new" element={<CreateReport />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
    </BrowserRouter>
  );
}