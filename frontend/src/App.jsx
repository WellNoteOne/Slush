import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [speakers, setSpeakers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/speakers")
      .then((res) => res.json())
      .then((data) => setSpeakers(data))
      .catch(console.error);
  }, []);

  const filtered = speakers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <h1>SLUSH SPEAKER FINDER</h1>

      <div className="input-cont">
        <input
          id="nameinp"
          placeholder="Enter name of your speaker"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid">
        {filtered.map((s, i) => (
          <div key={i} className="card" onClick={() => setSelected(s)}>
            <img src={s.img} alt={s.name} />
            <h2>{s.name}</h2>
            {s.bio && <p>{s.bio}</p>}
          </div>
        ))}
      </div>
      {selected && (
        <div className="popup" onClick={() => setSelected(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            {selected.description ? (
              <p>{selected.description}</p>
            ) : (
              <p>No description available</p>
            )}
            <button className="closebtn" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
