import React from 'react';
import RouterApp from './routes/Router';
import ErrorBoundary from './components/ErrorBoundary'; // Create this component

function App() {
  return (
    <ErrorBoundary>
      <RouterApp />
    </ErrorBoundary>
  );
}

export default App;
