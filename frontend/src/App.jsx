import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/index.jsx';
import SonnerToaster from './components/common/SonnerToaster.jsx';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SonnerToaster />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
