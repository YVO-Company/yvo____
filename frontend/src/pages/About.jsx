import React from 'react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-12">About YVO</h1>
      <p className="text-slate-500 text-center max-w-3xl mx-auto mb-20">YVO is an AI-powered SaaS platform focused on streamlining business operations and enabling smarter decision-making.</p>
      
      <div className="grid md:grid-cols-3 gap-8 mb-32">
        <div className="p-8 border border-slate-100 rounded-2xl">
          <h3 className="font-bold mb-2">🚀 Mission</h3>
          <p className="text-slate-500 text-sm">Empower businesses through intelligent automation.</p>
        </div>
        <div className="p-8 border border-slate-100 rounded-2xl">
          <h3 className="font-bold mb-2">👁️ Vision</h3>
          <p className="text-slate-500 text-sm">Build scalable enterprise solutions that redefine standards.</p>
        </div>
        <div className="p-8 border border-slate-100 rounded-2xl">
          <h3 className="font-bold mb-2">💙 Values</h3>
          <p className="text-slate-500 text-sm">Trust, Innovation, and Transparency are at our core.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-12 rounded-[3rem]">
        <h2 className="text-center text-3xl font-bold mb-12">Careers at YVO</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <JobCard title="Frontend Developer" location="Remote" />
          <JobCard title="Backend Engineer" location="New York" />
          <JobCard title="Product Designer" location="Remote" />
          <JobCard title="Data Scientist" location="Boston" />
        </div>
      </div>
    </div>
  );
}

const JobCard = ({ title, location }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
    <div>
      <h4 className="font-bold">{title}</h4>
      <p className="text-xs text-slate-400">{location}</p>
    </div>
    <button className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold">Apply Now</button>
  </div>
);