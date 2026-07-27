import "./Join.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Join() {

  const [username, setUsername] = useState("");
  const [error, setError] = useState(() => {

  const message = sessionStorage.getItem("joinError");

  if (message) {

    sessionStorage.removeItem("joinError");

    return message;

  }

  return "";

});

  const navigate = useNavigate();


  const handleJoin = () => {

    const trimmedUsername = username.trim();

    if (trimmedUsername === "") {

      setError("Please enter your name.");

      return;

    }

    navigate("/chat", {

      state: {

        username: trimmedUsername,

      },

    });

  };

  return (

    <div className="join-page">

      <div className="join-card">

        <h1 className="logo">
          💬 ConnectChat
        </h1>

        <p className="subtitle">
          Enter your name to start chatting
        </p>

        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => {

            setUsername(e.target.value);

            if (error) {

              setError("");

            }

          }}
          onKeyDown={(e) => {

            if (e.key === "Enter") {

              handleJoin();

            }

          }}
        />

        {error && (

          <div className="join-error">

            ⚠ {error}

          </div>

        )}

        <button onClick={handleJoin}>

          Join Chat

        </button>

      </div>

    </div>

  );

}

export default Join;