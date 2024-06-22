import React from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import Sensei from './components/Sensei';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div>
      <Header />

        <Router>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/sensei' element={<Sensei />} />
          </Routes>
        </Router>

      <Footer />
    </div>
  );
}

export default App;
