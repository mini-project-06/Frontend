import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const THEMES = [
  {
    name: 'purple',  label: '퍼플',
    primary: '#667eea', secondary: '#764ba2',
    bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    headerBg: 'rgba(255,255,255,0.75)',
    headingColor: '#667eea',
  },
  {
    name: 'vintage', label: '빈티지',
    primary: '#44A194', secondary: '#537D96',
    bg: 'linear-gradient(135deg, #F4F0E4 0%, #DCEAE8 100%)',
    headerBg: 'rgba(244,240,228,0.85)',
    headingColor: '#44A194',
  },
  {
    name: 'peach',   label: '피치',
    primary: '#FF9A86', secondary: '#EC8F8D',
    bg: 'linear-gradient(135deg, #FFF0BE 0%, #FFD6A6 100%)',
    headerBg: 'rgba(255,240,190,0.85)',
    headingColor: '#FF9A86',
  },
  {
    name: 'sage',    label: '세이지',
    primary: '#96A78D', secondary: '#B6CEB4',
    bg: 'linear-gradient(135deg, #F0F0F0 0%, #D9E9CF 100%)',
    headerBg: 'rgba(240,240,240,0.85)',
    headingColor: '#96A78D',
  },
  {
    name: 'spring',  label: '스프링',
    primary: '#F39EB6', secondary: '#B8DB80',
    bg: 'linear-gradient(135deg, #F7F6D3 0%, #FFE4EF 100%)',
    headerBg: 'rgba(247,246,211,0.85)',
    headingColor: '#F39EB6',
  },
  {
    name: 'dark',    label: '다크',
    primary: '#a78bfa', secondary: '#7c3aed',
    bg: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
    headerBg: 'rgba(15,15,26,0.95)',
    headingColor: '#c4b5fd',
    textMain: '#e2e8f0',
    textMuted: '#94a3b8',
    glassBg: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(255,255,255,0.1)',
  },
];

function applyTheme(theme) {
  const root = document.documentElement;
  document.body.setAttribute('data-theme', theme.name);
  root.style.setProperty('--primary-color',  theme.primary);
  root.style.setProperty('--secondary-color', theme.secondary);
  root.style.setProperty('--bg-gradient',    theme.bg);
  root.style.setProperty('--header-bg',      theme.headerBg);
  root.style.setProperty('--heading-color',  theme.headingColor);
  root.style.setProperty('--text-main',      theme.textMain   || '#2d3748');
  root.style.setProperty('--text-muted',     theme.textMuted  || '#718096');
  root.style.setProperty('--glass-bg',       theme.glassBg    || 'rgba(255,255,255,0.65)');
  root.style.setProperty('--glass-border',   theme.glassBorder|| 'rgba(255,255,255,0.4)');
}

function Header() {
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState(
    () => localStorage.getItem('theme') || 'purple'
  );

  useEffect(() => {
    const saved = THEMES.find((t) => t.name === activeTheme) || THEMES[0];
    applyTheme(saved);
  }, [activeTheme]);

  const handleThemeClick = (theme) => {
    setActiveTheme(theme.name);
    localStorage.setItem('theme', theme.name);
  };

  return (
    <header className="header">
      {/* 왼쪽: 로고 + 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h1 onClick={() => navigate('/')} style={{ margin: 0 }}>
          📚 오늘의 서재
        </h1>
        <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />
        <button className="btn-new" onClick={() => navigate('/books')}>도서 목록</button>
        <button className="btn-new" onClick={() => navigate('/books/new')}>도서 등록</button>
      </div>

      {/* 오른쪽 끝: 테마 팔레트 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
        {THEMES.map((theme) => (
          <button
            key={theme.name}
            onClick={() => handleThemeClick(theme)}
            title={theme.label}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: theme.name === 'dark'
                ? 'linear-gradient(135deg, #1a1a2e, #7c3aed)'
                : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              border: activeTheme === theme.name ? '3px solid white' : '2px solid rgba(255,255,255,0.4)',
              boxShadow: activeTheme === theme.name
                ? `0 0 0 2px ${theme.primary}, 0 4px 8px rgba(0,0,0,0.2)`
                : '0 2px 4px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </header>
  );
}

export default Header;