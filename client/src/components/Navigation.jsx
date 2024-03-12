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
                <Link to="/forumPosts"> Forum Posts </Link>
            </li>
            <li>
                <Link to="/friends">Friends</Link>
            </li>
            <li>
                <Link to="/messages">Messages</Link>
            </li>
            <li>
                <Link to="/settings">Settings</Link>
            </li>
            <li>
                <Link to="/random">Random</Link>
            </li>
            <li>
                <Link to="/userPlaylists">Playlists</Link>
            </li>
        </ul>
    </nav>)
}

export default NavigationComponent;

