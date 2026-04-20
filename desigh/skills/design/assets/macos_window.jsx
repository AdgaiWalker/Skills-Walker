/**
 * macos_window.jsx — macOS 桌面窗口组件
 * 用法：<MacOSWindow title="标题"> 包裹内容
 */
const MacOSWindow = ({ children, title = 'Untitled', width = '960px', height = '640px' }) => {
  const windowStyle = {
    width,
    height,
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column'
  };
  const titleBarStyle = {
    height: '38px',
    background: '#e8e8e8',
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    borderBottom: '1px solid #d0d0d0'
  };
  const dotStyle = (color) => ({
    width: '12px', height: '12px', borderRadius: '50%', background: color, marginRight: '8px'
  });
  const titleStyle = {
    flex: 1,
    textAlign: 'center',
    fontSize: '13px',
    color: '#444',
    fontWeight: 500,
    marginRight: '52px'
  };
  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: '0'
  };

  return React.createElement('div', { style: windowStyle },
    React.createElement('div', { style: titleBarStyle },
      React.createElement('div', { style: dotStyle('#ff5f57') }),
      React.createElement('div', { style: dotStyle('#febc2e') }),
      React.createElement('div', { style: dotStyle('#28c840') }),
      React.createElement('div', { style: titleStyle }, title)
    ),
    React.createElement('div', { style: contentStyle }, children)
  );
};

Object.assign(window, { MacOSWindow });
