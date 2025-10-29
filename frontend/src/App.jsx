import { useState } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  return (
    <>
      <h1>SLUSH SPEAKER FINDER</h1>
      <div className="input-cont">
        <input id="nameinp" placeholder="Enter name of your speaker"></input>
      </div>
    </>
  );
}

export default App;
