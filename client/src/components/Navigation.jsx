import React from 'react';
import {Link} from "react-router-dom";
const NavigationComponent= () => {
    return (<nav>
        <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link to="/register">Register</Link>
            </li>
            <li>
                <Link to="/forums">Forums</Link>
            </li>
        </ul>
    </nav>)
}

export default NavigationComponent;

