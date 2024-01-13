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
                <Link to="/friends">Friends</Link>
            </li>
            <li>
                <Link to="/settings">Settings</Link>
            </li>
        </ul>
    </nav>)
}

export default NavigationComponent;

