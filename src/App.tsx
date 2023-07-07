import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { AllFeed } from "./pages/main/all-feed";
import { HomeFeed } from "./pages/main/home-feed";
import { Login } from "./pages/login";
import { Navbar } from "./components/navbar";
import { CreatePost } from "./pages/create-post/create-post";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<AllFeed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/homefeed" element={<HomeFeed />} />
          <Route path="/createpost" element={<CreatePost />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
