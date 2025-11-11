import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { initDebugTools } from './utils/debug';

function App() {
  // Initialize debug tools in development
  React.useEffect(() => {
    initDebugTools();
  }, []);

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to MERN App</h1>
        </header>
        <main>
          {/* App content will go here */}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;