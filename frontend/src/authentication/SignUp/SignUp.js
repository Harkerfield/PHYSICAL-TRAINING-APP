import React, { useState } from "react";
import { appContext } from "../../App.js";
import { Link, useNavigate } from "react-router-dom";
import "../../components/Modal/Modal.css";
import './SignUp.css';

const SignUp = ({ closeModal }) => {
  const navigate = useNavigate();
  const { srvPort, team, setTeam } = React.useContext(appContext);
  const [message, setMessage] = useState("");
  const [teamMembers, setTeamMembers] = useState([{ firstName: '', lastName: '' }]);

  // Handle change for team members
  const handleTeamMemberChange = (index, field, value) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers[index][field] = value;
    setTeamMembers(newTeamMembers);
  };

  // Add a new team member
  const addTeamMember = () => {
    if (teamMembers.length < 5) {
      setTeamMembers([...teamMembers, { firstName: '', lastName: '' }]);
    }
  };

  //onSubmit handler for registering a new team
  const handleRegister = (e) => {
    e.preventDefault(); // prevent page reload
    const form = e.target;
    const formData = new FormData(form);
    const formJSON = Object.fromEntries(formData.entries());
    formJSON.teamMembers = teamMembers;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formJSON),
    };
    fetch(`/api/auth/register-team`, requestOptions)
      .then((response) => response.json())
      .then((teamData) => {
        if ("error" in teamData) {
          setMessage(teamData.error);
        } else {
          setMessage("Registration Successful");
          setTeam(teamData);
          navigate("/Game");
        }
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="mb-10">
              <div className="flex justify-center">
                <i className="ss ss-ss3 text-4xl text-amber-600" />
              </div>
              <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Team Registration
              </h2>
              <p className="mt-5 text-center text-sm text-red-600 dark:text-red-600">
                {message}
              </p>
              <form
                method="post"
                onSubmit={handleRegister}
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
                  <p className="mt-2 text-sm text-gray-600">{teamMembers.length}/5 team members.</p>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member, index) => (
                        <tr key={index} className="flex justify-between">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input name={`firstName-${index}`} type="text" placeholder="First Name" className="rounded-md border-gray-300 dark:border-none w-full dark:text-slate-200 dark:bg-light-white" value={member.firstName} onChange={(e) => handleTeamMemberChange(index, 'firstName', e.target.value)} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input name={`lastName-${index}`} type="text" placeholder="Last Name" className="rounded-md border-gray-300 dark:border-none w-full dark:text-slate-200 dark:bg-light-white" value={member.lastName} onChange={(e) => handleTeamMemberChange(index, 'lastName', e.target.value)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {teamMembers.length < 5 && (
                    <button type="button" onClick={addTeamMember} className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400">
                      Add Team Member
                    </button>
                  )}
                  <div>
                    <button
                      type="submit"
                      className="border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 mt-5"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
