import React from "react";
import "../css/aboutus.css";

const AboutUsComponent = () => {
  return (
    <div className="container">
      <div className="about-header">
        <h2>Meet The Team</h2>
        <p>Get to know the braintrust of ASMR Encyclopedia, our foundation, and what we hope to accomplish.</p>
      </div>
      <div className="team-grid">
        <TeamMemberCard
          name="Allen Tran"
          title="Founder"
          description="**Brief Description**"
          email="allen@gmail.com"
        />
        <TeamMemberCard
          name="Shyam Vyas"
          title="Founder"
          description="**Brief Description**"
          email="shyam@gmail.com"
        />
        <TeamMemberCard
          name="Ayaz Azhar"
          title="Founder"
          description="**Brief Description**"
          email="ayaz@gmail.com"
        />
        <TeamMemberCard
          name="Justin Yamamoto"
          title="Founder"
          description="**Brief Description**"
          email="justin@gmail.com"
        />
      </div>
    </div>
  );
};

const TeamMemberCard = ({ name, title, description, email }) => {
  return (
    <div className="team-member-card">
      <h3>{name}</h3>
      <p>{title}</p>
      <p>{description}</p>
      <a href={`mailto:${email}`}>{email}</a>
    </div>
  );
};

export default AboutUsComponent;