import React, { useState } from "react";
import axios from "axios";

const AboutUsComponent = () => {
  return (
    <div>
      <div className="about-section">
        <h2>About Us</h2>
        <p>Get to know the braintrust of ASMR Encyclopedia, our foundation, and what we hope to accomplish.</p>
      </div>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>The Team</h2>
      <div className="row">
        <TeamMemberCard
          name="Allen Tran"
          title="Founder"
          description="ADD BRIEF DESCRIPTION HERE"
          email="ADD EMAIL HERE"
        />
        <TeamMemberCard
          name="Shyam Vyas"
          title="Founder"
          description="ADD BRIEF DESCRIPTION HERE"
          email="ADD EMAIL HERE"
        />
        <TeamMemberCard
          name="Ayaz Azhar"
          title="Founder"
          description="ADD BRIEF DESCRIPTION HERE"
          email="ADD EMAIL HERE"
        />
        <TeamMemberCard
          name="Justin Yamamoto"
          title="Founder"
          description="ADD BRIEF DESCRIPTION HERE"
          email="ADD EMAIL HERE"
        />
      </div>
    </div>
  );
};

const TeamMemberCard = ({ name, title, description, email }) => {
  return (
    <div className="column">
      <div className="card">
        <img src={`/images/${name.toLowerCase()}picture.jpg`} alt={name} style={{ width: '100%' }} />
        <div className="container">
          <h2>{name}</h2>
          <p className="title">{title}</p>
          <p>{description}</p>
          <p>{email}</p>
          <p><a href="#" className="button">Contact</a></p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsComponent;