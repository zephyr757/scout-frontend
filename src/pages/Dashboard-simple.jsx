// Simple Dashboard for testing
import React from 'react';

function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-light text-brand-navy">Dashboard</h1>
      <p className="mt-4 text-gray-600">Dashboard is loading successfully!</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-soft">
          <h3 className="text-lg font-light text-brand-navy">Test Card 1</h3>
          <p className="mt-2 text-gray-500">This is a test card</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-soft">
          <h3 className="text-lg font-light text-brand-navy">Test Card 2</h3>
          <p className="mt-2 text-gray-500">Another test card</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;