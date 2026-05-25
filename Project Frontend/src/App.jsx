import { BrowserRouter, Route, Routes } from "react-router"

import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Store from "./pages/Store"
import Mouse from "./pages/Mouse"
import Keyboard from "./pages/Keyboard"
import Accessories from "./pages/Accessories"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Dashboard from "./pages/Dashboard"




function App(){
  return (
   <div>
   <BrowserRouter>
  
    <Header />
   <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/store" element={<Store />} />
    <Route path="/mouse" element={<Mouse />} />
    <Route path="/keyboard" element={<Keyboard />} />
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
