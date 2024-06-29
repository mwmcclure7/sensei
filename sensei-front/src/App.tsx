import React from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import Sensei from './components/Sensei';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signin from './components/Signin';
import Signup from './components/Signup';
import AccountCreated from './components/AccountCreated';
import Settings from './components/Settings';

function App() {
  return (
    <div>
      <Header />

        <Router>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/sensei' element={<Sensei />} />
            <Route path='/signin' element={<Signin />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/account-created' element={<AccountCreated />} />
            <Route path='/settings' element={<Settings />} />
          </Routes>
        </Router>
        
      <Footer />
    </div>
  );
}

export default App;
