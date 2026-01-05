import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="hero-container">
      <h1 className="hero-title">
        Code at the <br/> Speed of Thought
      </h1>
      <p style={{ color: '#8b949e', fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px' }}>
        The first AI-native IDE that turns your prompts into production-ready software.
      </p>
      
      <button 
        className="btn-primary" 
        style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '100px' }}
        onClick={() => navigate('/editor')}
      >
        <Sparkles size={20} /> Start Vibe Coding
      </button>
    </div>
  );
}