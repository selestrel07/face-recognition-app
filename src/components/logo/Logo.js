import React from "react";
import Tilt from 'react-parallax-tilt';
import './Logo.css'
import brain from './logo-brain.png'

const Logo = () => {
    return (
        <div className="ma4 mt0">
            <Tilt className="tilt" style={{ height: '100px', width: '100px', backgroundColor: 'darkgreen' }}>
                <div className="pa3">
                    <img style={{paddingTop: '5px'}} src={brain} alt="logo" />
                </div>
            </Tilt>
        </div>
    )
}

export default Logo;