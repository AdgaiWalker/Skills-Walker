/**
 * design_canvas.jsx — 设计画布组件，用于并排展示多个静态设计选项
 * 用法：<DesignCanvas> 包裹多个 <CanvasCell title="标题"> 子元素
 */
const DesignCanvas = ({ children, columns = 2, gap = 24, padding = 40 }) => {
  const canvasStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    padding: `${padding}px`,
    maxWidth: '1600px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#f5f5f5',
    alignItems: 'start'
  };
  return React.createElement('div', { style: canvasStyle }, children);
};

const CanvasCell = ({ title, children }) => {
  const cellStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  };
  const titleStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#666',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };
  return React.createElement('div', { style: cellStyle },
    React.createElement('div', { style: titleStyle }, title),
    children
  );
};

Object.assign(window, { DesignCanvas, CanvasCell });
