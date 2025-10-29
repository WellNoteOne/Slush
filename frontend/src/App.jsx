import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [speakers, setSpeakers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/speakers")
      .then((res) => res.json())
      .then((data) => setSpeakers(data))
      .catch(console.error);
  }, []);

  return (
    <>
      <h1>SLUSH SPEAKER FINDER</h1>
      <div className="input-cont">
        <input id="nameinp" placeholder="Enter name of your speaker"></input>
      </div>
      <div className="grid">
        {speakers.map((s, i) => (
          <div key={i} className="card">
            <img src={s.img} alt={s.name} />
            <h2>{s.name}</h2>
            <p>{s.bio}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
