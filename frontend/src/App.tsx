import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import TopBar from './components/TopBar';
import Profile from './components/Profile';
import Discussion from './components/Discussion';

function App() {
  return (
    <Router>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Discussion" element={<Discussion />} />
      </Routes>
    </Router>
  );
}

export default App;
