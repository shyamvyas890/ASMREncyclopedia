import React from 'react';
import {Link, useLocation} from "react-router-dom";
import NotificationsComponent from './Notifications';
import axios from 'axios';
const NavigationComponent= () => {
    const location = useLocation().pathname;    
    return (<nav>
        <ul>
            <li>
                <Link to="/">Home</Link>
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
        {location!== "/notifications"  && <NotificationsComponent />}
    </nav>)
}

export default NavigationComponent;

