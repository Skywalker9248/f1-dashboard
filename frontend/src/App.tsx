import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';

import { ColorModeProvider } from './context/ThemeContext';

function App() {
  return (
    <ColorModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ColorModeProvider>
  );
}

export default App;
