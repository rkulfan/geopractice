import { useState } from 'react';
import RussianPractice from './Transliteration';
import FlagPractice from './FlagPractice';
import './App.css';

enum Tab {
  Transliteration = 'Transliteration',
  Flags = 'Flags',
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Transliteration);

  return (
    <div>
      {/* Tabs */}
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="tabButton" onClick={() => setActiveTab(Tab.Transliteration)}>
          Russian Transliteration
        </button>
        <button className="tabButton" onClick={() => setActiveTab(Tab.Flags)}>
          Flag Identification
        </button>
      </nav>

      {/* Tab Content */}
      {activeTab === Tab.Transliteration && <RussianPractice />}
      {activeTab === Tab.Flags && <FlagPractice />}
    </div>
  );
}

export default App;