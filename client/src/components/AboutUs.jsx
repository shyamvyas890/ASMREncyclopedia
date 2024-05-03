import React from "react";
import AboutUsCSS from "../css/aboutus.module.css";
import NavigationComponent from "./Navigation";

const AboutUsComponent = () => {
  return (
    <div> 
      <NavigationComponent />
      <div className={AboutUsCSS["about-us-container"]}v>
      <div className={AboutUsCSS["about-header"]}>
        <h2> About Us </h2>
        <p>We are the founders of ASMR Encyclopedia. We hope to provide an interactive social media platform for ASMR enthusiasts to connect and share their passion for ASMR.</p>
      </div>
      <div className={AboutUsCSS["team-grid"]}>
        <TeamMemberCard
          name="Allen Tran"
          title="Founder"
          description="BS Software Engineering (San Jose State University)"
          email="allen.tran@sjsu.edu"
        />
        <TeamMemberCard
          name="Shyam Vyas"
          title="Founder"
          description="BS Software Engineering (San Jose State University)"
          email="shyam.vyas@sjsu.edu"
        />
        <TeamMemberCard
          name="Ayaz Azhar"
          title="Founder"
          description="BS Computer Engineering (San Jose State University)"
          email="ayaz.azhar@sjsu.edu"
        />
        <TeamMemberCard
          name="Justin Yamamoto"
          title="Founder"
          description="BS Software Engineering (San Jose State University)"
          email="justin.yamamoto@sjsu.edu"
        />
      </div>
    </div>
    </div>
    
  );
};

const TeamMemberCard = ({ name, title, description, email }) => {
  return (
    <div className={AboutUsCSS["team-member-card"]}>
      <h3>{name}</h3>
      <p>{title}</p>
      <p>{description}</p>
      <a href={`mailto:${email}`}>{email}</a>
    </div>
  );
};

export default AboutUsComponent;