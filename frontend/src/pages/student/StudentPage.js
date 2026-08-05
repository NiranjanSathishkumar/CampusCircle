import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ToastProvider } from "../../context/ToastContext";
import Navbar from "../../layouts/Navbar";
import ScrollToTop from "../../components/ScrollToTop";
import Footer from "../../layouts/Footer";

import LandingPage from "../landing/LandingPage";
import DiscoverPage from "../discover/DiscoverPage";
import CommunityPage from "../communities/CommunityPage";
import CommunityDetailPage from "../communities/CommunityDetailPage";
import EventsPage from "../events/EventsPage";
import BuddiesPage from "../buddies/BuddiesPage";
import BuddyProfilePage from "../buddies/BuddyProfilePage";
import EventDetailPage from "../events/EventDetailPage";
import MyEventsPage from "../myevents/MyEventsPage";
import ProfilePage from "../profile/ProfilePage";
import SignupPage from "../signup/SignupPage";
import LoginPage from "../login/LoginPage";
import AboutPage from "../static/AboutPage";
import ContactPage from "../static/ContactPage";
import PrivacyPage from "../static/PrivacyPage";
import TermsPage from "../static/TermsPage";

import LoadingPage from "../states/LoadingPage";
import ErrorPage from "../states/ErrorPage";
import NotFoundPage from "../states/NotFoundPage";
import NoResultsPage from "../states/NoResultsPage";
import AccessDeniedPage from "../states/AccessDeniedPage";
import SuccessPage from "../states/SuccessPage";
import EmptyStatePage from "../states/EmptyStatePage";

function StudentPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('isLoggedIn', 'true');
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="d-flex flex-column min-vh-100">
          <Navbar
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />

          <div className="flex-grow-1">
            <Routes>
              {/* Hybrid Routing: Unauthenticated "/" shows LandingPage, Authenticated "/" shows DiscoverPage */}
              <Route
                path="/"
                element={isLoggedIn ? <DiscoverPage /> : <LandingPage />}
              />

              {/* Explicit Landing Route */}
              <Route path="/landing"          element={<LandingPage />} />

              {/* Application Routes */}
              <Route path="/discover"         element={<DiscoverPage />} />
              <Route path="/posts/:id"        element={<DiscoverPage />} />
              <Route path="/discover/post/:id" element={<DiscoverPage />} />
              <Route path="/communities"      element={<CommunityPage />} />
              <Route path="/communities/:id"  element={<CommunityDetailPage />} />
              <Route path="/events"           element={<EventsPage />} />
              <Route path="/events/:id"       element={<EventDetailPage />} />
              <Route path="/buddies"          element={<BuddiesPage />} />
              <Route path="/buddies/:id"      element={<BuddyProfilePage />} />
              <Route path="/myevents"         element={<MyEventsPage />} />
              <Route path="/profile"          element={<ProfilePage />} />
              <Route path="/profile/:id"      element={<ProfilePage />} />
              <Route path="/signup"           element={<SignupPage onSignupSuccess={handleLoginSuccess} />} />
              <Route path="/login"            element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />



              {/* Static / Info Routes */}
              <Route path="/about"            element={<AboutPage />} />
              <Route path="/contact"          element={<ContactPage />} />
              <Route path="/privacy"          element={<PrivacyPage />} />
              <Route path="/terms"            element={<TermsPage />} />

              {/* State Pages */}
              <Route path="/loading"          element={<LoadingPage />} />
              <Route path="/error"            element={<ErrorPage />} />
              <Route path="/no-results"       element={<NoResultsPage />} />
              <Route path="/access-denied"    element={<AccessDeniedPage />} />
              <Route path="/success"          element={<SuccessPage />} />
              <Route path="/empty"            element={<EmptyStatePage />} />

              {/* 404 Catch-All — must be last */}
              <Route path="*"                 element={<NotFoundPage />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default StudentPage;
