import React from 'react';
import { motion } from 'framer-motion';

export const About = () => {
  return (
    <div className="py-24 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-primary mb-6">About Us</h1>
        <p className="text-lg text-slate-600 mb-8">
          We are a technology company specializing in AI Agents, Web Development, and Business Automation. 
          Our mission is to help businesses leverage modern technology to scale efficiently.
        </p>
      </div>
    </div>
  );
};
