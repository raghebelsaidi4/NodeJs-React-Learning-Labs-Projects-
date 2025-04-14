import './App.css'
import ClockPage from './pages/ClockPage';
import {Router} from "@reach/router";
import Tasks from "./pages/Tasks.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Help from "./pages/Help.jsx";

function App() {
    return (
        <Router>
            <Home path="/" />
            <About path="/about" />
            <Help path="/help" />
            <ClockPage path="/clock" />
            <Tasks path="/tasks" />
        </Router>
    );
}

export default App;
