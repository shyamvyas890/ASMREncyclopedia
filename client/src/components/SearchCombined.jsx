import React, { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import SearchVideosComponent from './SearchVideos';
import { SearchForumPostComponent } from './SearchForumPostComponent';
import axios from '../utils/AxiosWithCredentials';

const SearchCombinedComponent = ()=>{
    const [tabIndex, setTabIndex] = useState(0)
    const [keyword, setKeyword] = React.useState(useParams().keyword);
    const navigate = useNavigate();
    const handleTabSelection = (index)=>{
        setTabIndex(index);
    }
    const tokenVerify = async (e) =>{
        try{
            await axios.get(`http://localhost:3001/verify-token`)
        }
        catch(error){
            navigate("/")
            console.log(error);
        }
    }
    React.useEffect(()=>{
        tokenVerify();
    },[]);
    return (
        <Tabs selectedIndex={tabIndex} onSelect={handleTabSelection}>
            <TabList>
                <Tab>Video Search</Tab>
                <Tab>Forum Search</Tab>
            </TabList>
            <TabPanel>
                <SearchVideosComponent keyword={keyword}/>
            </TabPanel>
            <TabPanel>
                <SearchForumPostComponent searchTitle={keyword} />
            </TabPanel>
        </Tabs>
    )
}

export default SearchCombinedComponent;