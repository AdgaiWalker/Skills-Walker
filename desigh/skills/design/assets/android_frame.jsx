/**
 * android_frame.jsx — Android 设备边框组件
 * 用法：<AndroidFrame> 包裹你的设计内容
 */
const AndroidFrame = ({ children, color = '#1a1a1a', showKeyboard = false }) => {
  const frameStyle = {
    width: '380px',
    borderRadius: '28px',
    overflow: 'hidden',
    background: color,
    padding: '10px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  };
  const screenStyle = {
    width: '360px',
    height: '780px',
    background: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative'
  };
  const statusBarStyle = {
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    fontSize: '13px',
    color: '#000'
  };
  const homeBarStyle = {
    width: '134px',
    height: '5px',
    background: '#000',
    borderRadius: '3px',
    margin: '8px auto'
  };

  const keyboard = showKeyboard ? React.createElement('div', {
    style: { height: '260px', background: '#e0e0e0', padding: '6px 4px' }
  }) : null;

  return React.createElement('div', { style: frameStyle },
    React.createElement('div', { style: screenStyle },
      React.createElement('div', { style: statusBarStyle },
        React.createElement('span', null, '12:30'),
        React.createElement('span', null, '\u25BE \u25CF\u25CF\u25CF')
      ),
      React.createElement('div', { style: { height: '700px', overflow: 'auto' } }, children),
      keyboard
    ),
    React.createElement('div', { style: homeBarStyle })
  );
};

Object.assign(window, { AndroidFrame });
