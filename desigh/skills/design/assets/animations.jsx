/**
 * animations.jsx — 基于时间线的动画引擎
 * 提供 <Stage>, <Sprite>, useTime(), useSprite(), Easing, interpolate()
 * 用法：在 Stage 内组合多个 Sprite，构建场景动画
 */
const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;

const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutBack: (t, s = 1.70158) => { const t2 = t - 1; return t2 * t2 * ((s + 1) * t2 + s) + 1; },
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1,
  easeOutBounce: t => { if (t < 1/2.75) return 7.5625*t*t; if(t<2/2.75) return 7.5625*(t-=1.5/2.75)*t+.75; if(t<2.5/2.75) return 7.5625*(t-=2.25/2.75)*t+.9375; return 7.5625*(t-=2.625/2.75)*t+.984375; }
};

const interpolate = (from, to, progress) => from + (to - from) * progress;

const TimelineContext = createContext({ time: 0, duration: 5 });

const useTime = () => useContext(TimelineContext).time;
const useSprite = () => {
  const { time } = useContext(TimelineContext);
  return { time, isActive: true };
};

const Sprite = ({ start = 0, end = 5, children, style = {} }) => {
  const { time } = useContext(TimelineContext);
  const progress = Math.max(0, Math.min(1, (time - start) / (end - start)));
  const visible = time >= start && time <= end;

  if (!visible && progress === 0) return null;

  return React.createElement('div', {
    style: {
      ...style,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.1s'
    }
  }, typeof children === 'function' ? children({ progress, time }) : children);
};

const Stage = ({ children, duration = 5, width = 1920, height = 1080, autoPlay = true }) => {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const tick = useCallback((ts) => {
    if (!lastRef.current) lastRef.current = ts;
    const delta = (ts - lastRef.current) / 1000;
    lastRef.current = ts;
    setTime(prev => {
      const next = prev + delta;
      if (next >= duration) { setPlaying(false); return duration; }
      return next;
    });
    rafRef.current = requestAnimationFrame(tick);
  }, [duration]);

  useEffect(() => {
    if (playing) { lastRef.current = null; rafRef.current = requestAnimationFrame(tick); }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, tick]);

  const scale = Math.min(window.innerWidth / width, window.innerHeight / height, 1);
  const seconds = Math.floor(time);
  const ms = Math.floor((time - seconds) * 100);

  const controlsStyle = { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
    display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,.7)',
    padding: '8px 16px', borderRadius: '8px', color: '#fff', fontFamily: 'monospace', fontSize: '14px', zIndex: 100 };

  return React.createElement(TimelineContext.Provider, { value: { time, duration } },
    React.createElement('div', {
      style: { width, height, transform: `scale(${scale})`, transformOrigin: 'top left',
        position: 'absolute', top: '50%', left: '50%', marginLeft: `-${width*scale/2}px`,
        marginTop: `-${height*scale/2}px` }
    }, children),
    React.createElement('div', { style: controlsStyle },
      React.createElement('button', { onClick: () => { setTime(0); setPlaying(true); } }, '\u23EE'),
      React.createElement('button', { onClick: () => setPlaying(!playing) }, playing ? '\u23F8' : '\u25B6'),
      React.createElement('span', null, `${seconds}.${String(ms).padStart(2,'0')}s / ${duration}s`),
      React.createElement('input', { type: 'range', min: 0, max: duration, step: 0.01,
        value: time, onChange: e => setTime(parseFloat(e.target.value)),
        style: { width: '200px' } })
    )
  );
};

Object.assign(window, { Stage, Sprite, useTime, useSprite, Easing, interpolate, TimelineContext });
