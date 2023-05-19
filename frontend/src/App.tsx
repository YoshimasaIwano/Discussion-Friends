import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import TopBar from "./components/topbar/TopBar";
import Profile from "./components/profile/Profile";
import Discussion from "./components/discussion/Discussion";

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
