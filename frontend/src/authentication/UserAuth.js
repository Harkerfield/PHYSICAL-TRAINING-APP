import React, { useState, useEffect } from "react";
import { appContext } from "../App.js";
import { Link, useNavigate } from "react-router-dom";
import SignUp from "./SignUp";

const UserAuth = () => {
  const navigate = useNavigate();
  const { srvPort, user, setUser } = React.useContext(appContext);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      navigate("/game");
    }
  }, [navigate, setUser]);

  // onSubmit handler for logging in a team
  const handleLogin = (e) => {
    e.preventDefault(); // prevent page reload
    const form = e.target;
    const formData = new FormData(form);
    const formJSON = Object.fromEntries(formData.entries());
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formJSON),
    };
    fetch(`http://localhost:${srvPort}/user/login-team`, requestOptions)
      .then((response) => response.json())
      .then((teamData) => {
        if ("error" in teamData) {
          setMessage(teamData.error);
        } else {
          setMessage("Login Successful");
          setUser(teamData);
          localStorage.setItem("user", JSON.stringify(teamData)); // Set local storage
          navigate("/game");
        }
      });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="mb-10">
              <div className="flex justify-center">
                <i className="ss ss-ss3 text-4xl text-amber-600" />
              </div>
              <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Team Log In
              </h2>
              <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-200">
                Don't have a team yet?
                <button
                  onClick={openModal}
                  className="font-medium text-amber-600 hover:text-amber-400 ml-2"
                >
                  Signup
                </button>
              </p>
              <p className="mt-5 text-center text-sm text-red-600 dark:text-red-600">
                {message}
              </p>
              <form
                method="post"
                onSubmit={handleLogin}
                className="mt-8 space-y-6"
              >
                <div className="-space-y-px">
                  <div className="my-5">
                    <label htmlFor="teamName" className="sr-only">
                      Team Name
                    </label>
                    <input
                      name="teamName"
                      type="text"
                      placeholder="Team Name"
                      className="rounded-md border-gray-300 dark:border-none w-full dark:text-slate-200 dark:bg-light-white"
                    />
                  </div>
                  <div className="my-5">
                    <label htmlFor="pinCode" className="sr-only">
                      Pin Code
                    </label>
                    <input
                      name="pinCode"
                      type="password"
                      placeholder="Pin Code"
                      className="rounded-md border-gray-300 w-full dark:border-none dark:text-slate-200 dark:bg-light-white"
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 mt-5"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && <SignUp closeModal={closeModal} />}
    </div>
  );
};

export default UserAuth;
