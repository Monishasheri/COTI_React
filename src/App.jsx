import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import CotiBalanceChecker from "./components/COTIBalanceChecker";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <CotiBalanceChecker />;
    </>
  );
}

export default App;
