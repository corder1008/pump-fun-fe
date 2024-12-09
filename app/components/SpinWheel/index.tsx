import React, { useEffect, useRef } from 'react';

interface SpinWheelProps {
  items: { value: string; tokenAddress: string }[];
  onFinishSpin: (selectedItem: { value: string; tokenAddress: string }) => void;
  isSpinning: boolean;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ items, onFinishSpin, isSpinning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRotation = useRef(0);
  const animationRef = useRef<number>();

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    const drawWheel = (rotation: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw segments
      items.forEach((item, index) => {
        const angle = (2 * Math.PI) / items.length;
        const startAngle = rotation + index * angle;
        const endAngle = rotation + (index + 1) * angle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + angle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText(item.value, radius - 20, 5);
        ctx.restore();
      });

      // Draw center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.stroke();
    };

    const animate = () => {
      const targetRotation = currentRotation.current + (Math.random() * 4 + 8) * Math.PI;
      let startTime: number | null = null;
      const duration = 3000; // 3 seconds

      const spin = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / duration;

        if (progress < 1) {
          const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
          const currentAngle = currentRotation.current + (targetRotation - currentRotation.current) * easeOut;
          drawWheel(currentAngle);
          animationRef.current = requestAnimationFrame(spin);
        } else {
          currentRotation.current = targetRotation % (2 * Math.PI);
          drawWheel(currentRotation.current);
          
          // Calculate selected item
          const normalizedRotation = (currentRotation.current % (2 * Math.PI)) / (2 * Math.PI);
          const itemIndex = Math.floor(normalizedRotation * items.length);
          const selectedItem = items[items.length - 1 - itemIndex];
          onFinishSpin(selectedItem);
        }
      };

      animationRef.current = requestAnimationFrame(spin);
    };

    drawWheel(currentRotation.current);

    if (isSpinning) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [items, isSpinning, onFinishSpin]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="border rounded-full"
      />
      <div className="absolute top-0 left-1/2 -ml-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-black" />
    </div>
  );
};