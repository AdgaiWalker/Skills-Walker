/**
 * browser_window.jsx — 浏览器窗口组件
 * 用法：<BrowserWindow url="https://..."> 包裹内容
 */
const BrowserWindow = ({ children, url = 'https://example.com', width = '1024px', height = '680px' }) => {
  const windowStyle = {
    width,
    height,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column'
  };
  const toolbarStyle = {
    height: '42px',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    borderBottom: '1px solid #d0d0d0',
    gap: '8px'
  };
  const tabStyle = {
    background: '#fff',
    padding: '6px 16px',
    borderRadius: '6px 6px 0 0',
    fontSize: '12px',
    color: '#333',
    border: '1px solid #d0d0d0',
    borderBottom: 'none'
  };
  const urlBarStyle = {
    flex: 1,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '5px 12px',
    fontSize: '12px',
    color: '#555'
  };
  const contentStyle = {
    flex: 1,
    overflow: 'auto'
  };

  return React.createElement('div', { style: windowStyle },
    React.createElement('div', { style: toolbarStyle },
      React.createElement('div', { style: tabStyle }, url.replace(/https?:\/\//, '').split('/')[0]),
      React.createElement('div', { style: urlBarStyle }, url)
    ),
    React.createElement('div', { style: contentStyle }, children)
  );
};

Object.assign(window, { BrowserWindow });
