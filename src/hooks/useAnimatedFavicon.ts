import { useEffect } from 'react';

export function useAnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    const animate = () => {
      ctx.clearRect(0, 0, 32, 32);
      
      const time = frame * 0.05;
      const size = 10;
      
      ctx.save();
      ctx.translate(16, 16);
      
      // 3D Rotation simulation
      const xRot = Math.sin(time * 0.7);
      const yRot = Math.cos(time * 0.5);
      
      // Vertices of a cube
      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ];

      const project = (v: number[]) => {
        let x = v[0], y = v[1], z = v[2];
        
        // Rotate Y
        const x1 = x * Math.cos(yRot) - z * Math.sin(yRot);
        const z1 = x * Math.sin(yRot) + z * Math.cos(yRot);
        
        // Rotate X
        const y2 = y * Math.cos(xRot) - z1 * Math.sin(xRot);
        const z2 = y * Math.sin(xRot) + z1 * Math.cos(xRot);
        
        const scale = 15 / (z2 + 4);
        return [x1 * scale * size, y2 * scale * size];
      };

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#00ff88';

      edges.forEach(edge => {
        const p1 = project(vertices[edge[0]]);
        const p2 = project(vertices[edge[1]]);
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      });

      ctx.restore();

      link.href = canvas.toDataURL('image/png');
      frame++;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);
}
