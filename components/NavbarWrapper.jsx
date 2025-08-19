"use client"
import { useState } from "react"
import Navbar from "./Navbar"

const NavbarWrapper = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    

    return <Navbar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
}

export default NavbarWrapper