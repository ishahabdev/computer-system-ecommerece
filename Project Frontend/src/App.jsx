import { BrowserRouter, Route, Routes } from "react-router"

import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home/Home"
import Store from "./pages/Store/Store"
import Accessories from "./pages/Accessories/Accessories"
import About from "./pages/About/About"
import Contact from "./pages/Contact/Contact"
import Dashboard from "./pages/Dashbaord/Dashboard"

function App(){
  return (
   <div>
   <BrowserRouter>

    <Header />
   <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/store" element={<Store />} />
    <Route path="/accessories" element={<Accessories />} />
    <Route path="/about" element={<About />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/contact" element={<Contact />} />



   </Routes>


   <Footer />
   </BrowserRouter>

   </div>
  )
}


export default App
