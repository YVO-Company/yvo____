import React from 'react';

export default function Download() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h1 className="text-4xl font-black mb-6">Get the YVO Desktop App</h1>
          <p className="text-slate-500 mb-8">Enhance your productivity with native system integration.</p>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded font-bold text-sm">Download for Windows</button>
            <button className="bg-slate-100 px-6 py-3 rounded font-bold text-sm">Download for macOS</button>
          </div>
        </div>
        <img src="https://placehold.co/500x300" alt="App Preview" className="rounded-xl shadow-lg"/>
      </div>
      
      <div className="grid md:grid-cols-2 gap-20 border-t pt-20">
        <div>
          <h3 className="text-xl font-bold mb-6">Installation Guide</h3>
          <ul className="space-y-6 text-sm text-slate-600">
            <li><strong>Step 1:</strong> Download the installer for your OS.</li>
            <li><strong>Step 2:</strong> Run the YVO-Setup.exe or .dmg file.</li>
            <li><strong>Step 3:</strong> Follow the on-screen instructions.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-6">System Requirements</h3>
          <p className="text-sm text-slate-500">Windows 10/11 (64-bit) or macOS 12.0+</p>
          <p className="text-sm text-slate-500 mt-2">8GB RAM / 500MB Disk Space</p>
        </div>
      </div>
    </div>
  );
}