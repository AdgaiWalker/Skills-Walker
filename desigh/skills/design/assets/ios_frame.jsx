/**
 * ios_frame.jsx — iOS 设备边框组件
 * 用法：<IOSFrame> 包裹你的设计内容
 */
const IOSFrame = ({ children, color = '#1a1a1a', showKeyboard = false }) => {
  const frameStyle = {
    width: '375px',
    borderRadius: '44px',
    overflow: 'hidden',
    background: color,
    padding: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative'
  };
  const screenStyle = {
    width: '351px',
    height: '757px',
    background: '#fff',
    borderRadius: '34px',
    overflow: 'hidden',
    position: 'relative'
  };
  const notchStyle = {
    width: '150px',
    height: '30px',
    background: color,
    borderRadius: '0 0 18px 18px',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10
  };
  const statusBarStyle = {
    height: '54px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: '0 28px 8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#000'
  };
  const homeIndicatorStyle = {
    width: '134px',
    height: '5px',
    background: '#000',
    borderRadius: '3px',
    margin: '8px auto'
  };

  const keyboard = showKeyboard ? React.createElement('div', {
    style: { height: '260px', background: '#d1d3d9', padding: '6px 4px' }
  }) : null;

  return React.createElement('div', { style: frameStyle },
    React.createElement('div', { style: screenStyle },
      React.createElement('div', { style: notchStyle }),
      React.createElement('div', { style: statusBarStyle },
        React.createElement('span', null, '9:41'),
        React.createElement('span', null, '\u25CF\u25CF\u25CF')
      ),
      React.createElement('div', { style: { height: '680px', overflow: 'auto' } }, children),
      keyboard
    ),
    React.createElement('div', { style: homeIndicatorStyle })
  );
};

Object.assign(window, { IOSFrame });
