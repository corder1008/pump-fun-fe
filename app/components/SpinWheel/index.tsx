import React, { useEffect, useRef } from "react";

interface SpinWheelProps {
  items: { value: string; tokenAddress: string }[];
  onFinishSpin: () => void;
  isSpinning: boolean;
  selectedAddress?: string;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  items,
  onFinishSpin,
  selectedAddress,
  isSpinning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRotation = useRef(0);
  const animationRef = useRef<number>();

  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];

  // Add this function outside useEffect to reuse it
  const drawWheel = (ctx: CanvasRenderingContext2D, rotation: number) => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    items.forEach((item, index) => {
      const angle = (2 * Math.PI) / items.length;
      const startAngle = rotation + index * angle - Math.PI / 2; // Subtract PI/2 to shift -90 degrees
      const endAngle = rotation + (index + 1) * angle - Math.PI / 2;

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
      ctx.textAlign = "right";
      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.fillText(item.value, radius - 20, 5);
      ctx.restore();
    });
  };

  // Add initial draw effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawWheel(ctx, currentRotation.current);
  }, [items]); // Redraw when items change

  useEffect(() => {
    if (!isSpinning || !selectedAddress) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Find the index of the selected token
    const targetIndex = items.findIndex(
      (item) => item.tokenAddress === selectedAddress
    );

    // Calculate the target rotation
    const segmentAngle = (2 * Math.PI) / items.length;
    const targetRotation =
      (items.length - targetIndex - 1) * segmentAngle +
      Math.random() * segmentAngle * 0.5 + // Add some randomness
      Math.PI * 8; // Add extra rotations

    const animate = () => {
      let startTime: number | null = null;
      const duration = 3000; // 3 seconds

      const spin = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / duration;

        if (progress < 1) {
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentAngle =
            currentRotation.current +
            (targetRotation - currentRotation.current) * easeOut;
          drawWheel(ctx, currentAngle);
          animationRef.current = requestAnimationFrame(spin);
        } else {
          currentRotation.current = targetRotation % (2 * Math.PI);
          drawWheel(ctx, currentRotation.current);
          onFinishSpin();
        }
      };

      animationRef.current = requestAnimationFrame(spin);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, selectedAddress, items, onFinishSpin, colors]);

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
