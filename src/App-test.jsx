// MINIMAL TEST VERSION - App.jsx
import React from 'react';

function App() {
  return (
    <div style={{
      padding: '50px',
      fontSize: '24px',
      color: '#234071',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🎉 Scout Test - React is Working!</h1>
      <p>If you see this, React is mounting correctly.</p>
      <div style={{
        background: '#66d1ba',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        ✅ Frontend: Connected<br/>
        ✅ React: Mounting<br/>
        ✅ Styling: Working
      </div>
    </div>
  );
}

export default App;