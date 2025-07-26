// src/components/ui/Card.jsx

import React from "react";

const Card = ({ children }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      {children} 
    </div>
    
  );
};

export default Card;
