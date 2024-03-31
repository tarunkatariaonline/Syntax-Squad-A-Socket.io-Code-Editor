
import { BrowserRouter as Router,Routes,Route } from "react-router-dom"
import Home from "./Components/Home"
import CodeRoom from "./Components/CodeRoom"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {


  return (
    <>
      <Router>
        <Routes>
         <Route path="/" element={<Home/>}/>
         <Route path="/about" element={<div>about</div>}/>
         <Route path="/code/:id" element={<CodeRoom/>}/>
        </Routes>
     
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
