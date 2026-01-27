// Login.jsx
import { useState } from "react";
import "./Login.css";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Swal from 'sweetalert2';

const showError = (message) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonColor: "#6C63FF"
  });
};

const showSuccess = (message) => {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    confirmButtonColor: "#6C63FF"
  });
};

const showWarning = (message) => {
  Swal.fire({
    icon: "warning",
    title: "Warning",
    text: message,
    confirmButtonColor: "#6C63FF"
  });
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage({ onLogin }) {
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");

const handleLogin = async () => {
  if (!inputUsername || !inputPassword) {
    showWarning("Please enter both email and password.");
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inputUsername.trim(),
        password: inputPassword,
      }),
    });

    // ❗ Handle server down / invalid JSON
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (response.status === 401) {
        showError("Incorrect email or password.");
        return;
      }

      if (response.status === 403) {
        showError("Your account is not authorized.");
        return;
      }

      showError(errorData?.message || "Login failed. Please try again.");
      return;
    }

    const data = await response.json();

    showSuccess("Login successful!");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    onLogin();

  } catch (error) {
    showError("Unable to connect to the server. Please check your connection.");
  }
};

  const [stage, setStage] = useState("loading"); 
  // "loading" → first screen
  // "loginOptions" → second screen UI with login buttons

  const handleChatNow = () => {
    setStage("loginOptions");
  };

  const closeLoginModal = () => {
    setStage("loading");
  };

  return (
    <>
      {/* ✅ Stage 1: Loading Screen w/ Chat Now */}
      {stage === "loading" && (
        <div className="home-screen">
          <div className="content">
            <img
              src="/LogoReal4.png"
              alt="Ataraxia Logo"
              className="loading-logo"
            />
            <center>
            <button className="button" onClick={handleChatNow}>
              Chat Now
            </button>
            </center>
          </div>
        </div>
      )}

      {/* ✅ Stage 2: Modal Login Options */}
      {stage === "loginOptions" && (
        <div className="overlay">
          <div className="app" onClick={(e) => e.stopPropagation()}>
          <button className="ex-btn" onClick={closeLoginModal}>×</button>
            <center>
            <img
              src="/logo2.jpg"
              alt="Ataraxia Logo"
              className="loading-logo"
            />
            <button className="button_2" onClick={() => setStage("loginForm")}>Login</button>
            <button className="button_3" onClick={() => {
              showSuccess("You are now logged in as a Guest.");
              onLogin(); // Go to main page
            }}
          >
            Login as Guest
          </button>

            </center>
          </div>
        </div>
      )}
      
      {/* ✅ Stage 3: Login Form */}
      {stage === "loginForm" && (
        <div className="overlay">
          <div className="app" onClick={(e) => e.stopPropagation()}>
            <button className="ex-btn" onClick={closeLoginModal}>×</button>
            <img src="/LogoReal0.png" alt="Ataraxia Logo" className="logo" />

            <h2>Welcome, User!</h2>
            <h3 id="text">Login</h3>
            <div className="input-box">
              <i className="fa-solid fa-user icon" id="user_icon"></i>
              <input className="email" type="email" placeholder="Email" value={inputUsername} onChange={(e ) => setInputUsername(e.target.value)}/>
            </div>
            <div className="input-box">
              <i className="fa-solid fa-lock icon" id="lock_icon"></i>
              <input className="password" type="password" placeholder="Password" value={inputPassword} onChange={(e ) => setInputPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}/>
            </div>

            <button className="button_4" onClick={handleLogin}>Submit</button>

            <div className="divider">or</div>

            <p className="signup-text">
              Don’t have an account?{" "}
              <span className="signup-link" onClick={() => setStage("signUpForm")}>
                Sign Up here
              </span>
            </p>
          </div>
        </div>
      )}

        {/* ✅ Stage 4: Sign Up Form */}
        {stage === "signUpForm" && (
          <div className="overlay">
            <div className="app" onClick={(e) => e.stopPropagation()}>
              {/* close returns to loginForm stage */}
              <button className="ex-btn" onClick={() => setStage("loginForm")}>×</button>

              <h2>Sign Up</h2>

              {/* Username */}
              <div className="input-box">
                <i className="fa-solid fa-user icon" id="user_icon"></i>
                <input className="email" type="text" placeholder="Username" onKeyDown={(e) => e.key === "Enter" && handleLogin()}/>
              </div>

              {/* Email */}
              <div className="input-box">
                <i className="fa-solid fa-lock icon" id="lock_icon"></i>
                <input className="email" type="email" placeholder="Email"  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>

              {/* Password */}
              <div className="input-box">
                <i className="fa-solid fa-key" id="lock_icon2"></i>
                <input className="password" type="password" placeholder="Password"  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>

              {/* Confirm Password */}
              <div className="input-box">
                <i className="fa-solid fa-key" id="lock_icon3"></i>
                <input className="password" type="password" placeholder="Confirm Password"  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>

              <button
                className="button_5"
                onClick={async () => {
                  const username = document.querySelector("input[placeholder='Username']").value.trim();
                  const email = document.querySelector("input[placeholder='Email']").value.trim();
                  const password = document.querySelector("input[placeholder='Password']").value.trim();
                  const confirmPassword = document.querySelector("input[placeholder='Confirm Password']").value.trim();
              
                  if (!username || !email || !password || !confirmPassword) {
                    showWarning("Please fill out all fields.");
                    return;
                  }
              
                  if (!emailPattern.test(email)) {
                    showError("Please enter a valid email address.");
                    return;
                  }
              
                  if (password.length < 6) {
                    showWarning("Password must be at least 6 characters long.");
                    return;
                  }
              
                  if (password !== confirmPassword) {
                    showError("Passwords do not match.");
                    return;
                  }
              
                  // ✅ Log payload for debugging
                  const payload = { username, email: email.toLowerCase(), password, confirmPassword };
                  console.log("SignUp Payload:", payload);
              
                  try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
              
                    const data = await res.json().catch(() => null);
                    console.log("Server response:", data); // 🔥 See why 400 happens
              
                    if (!res.ok) {
                      if (res.status === 409) {
                        showError("This email is already registered.");
                        return;
                      }
                      if (res.status === 400) {
                        showError(data?.message || "Invalid registration details.");
                        return;
                      }
                      showError(data?.message || "Sign-up failed. Please try again.");
                      return;
                    }
              
                    showSuccess("Sign-up successful! You may now log in.");
                    setStage("loginForm");
              
                  } catch (error) {
                    showError("Unable to connect to the server. Please try again later.");
                  }
                }}
              >
                Submit
              </button>
              
              <p className="signup-text">
                Already have an account?{" "}
                <span className="signup-link" onClick={() => setStage("loginForm")}>
                  Login here
                </span>
              </p>
            </div>
          </div>
        )}
    </>
  );
}

export default LoginPage;

