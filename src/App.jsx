import React, { useRef, useEffect, useState } from 'react';

const App = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('drawing_channel');

    channelRef.current.onmessage = (event) => {
      if (event.data.line) {
        setLines((prevLines) => {
          const updatedLines = [...prevLines];
          if (updatedLines.length === 0 || !updatedLines[updatedLines.length - 1]) {
            updatedLines.push([]);
          }
          updatedLines[updatedLines.length - 1].push(event.data.line);
          return updatedLines;
        });
      }
    };

    return () => {
      channelRef.current.close();
    };
  }, []);

  const startDrawing = (e) => {
    setDrawing(true);
    const newLine = [{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }];
    setLines((prev) => {
      const updatedLines = [...prev, newLine];
      channelRef.current.postMessage({ line: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY } });
      return updatedLines;
    });
  };

  const draw = (e) => {
    if (!drawing) return;

    const newPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    setLines((prev) => {
      const updatedLines = [...prev];
      if (updatedLines.length === 0) {
        updatedLines.push([newPoint]);
      } else {
        updatedLines[updatedLines.length - 1].push(newPoint);
      }
      channelRef.current.postMessage({ line: newPoint });
      return updatedLines;
    });
  };

  const endDrawing = () => {
    setDrawing(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(line => {
      context.beginPath();
      context.moveTo(line[0].x, line[0].y);
      for (let i = 1; i < line.length; i++) {
        context.lineTo(line[i].x, line[i].y);
      }
      context.stroke();
    });
  }, [lines]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    </div>
  );
};

export default App;