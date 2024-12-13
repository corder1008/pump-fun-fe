import React, { useEffect, useRef } from "react";
import Image from "next/image";

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

  const colors = [
    "#8B5CF6",
    "#3B82F6",
    "#84CC16",
    "#EAB308",
    "#EF4444",
    "#F97316",
    "#F97171",
    "#EC4899",
  ];

  const drawWheel = (ctx: CanvasRenderingContext2D, rotation: number) => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 30; // Larger margin for outer edge
    const gapAngle = 0.1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach((item, index) => {
      const angle = (2 * Math.PI) / items.length;
      const segmentAngle =
        (2 * Math.PI - gapAngle * items.length) / items.length;

      const startAngle =
        rotation + index * (segmentAngle + gapAngle) - Math.PI / 2;

      const endAngle = startAngle + segmentAngle;

      // Draw main segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      const createGradientStroke = (
        ctx: CanvasRenderingContext2D,
        startAngle: number,
        endAngle: number
      ) => {
        const gradient = ctx.createLinearGradient(
          centerX + radius * Math.cos(startAngle),
          centerY + radius * Math.sin(startAngle),
          centerX + radius * Math.cos(endAngle),
          centerY + radius * Math.sin(endAngle)
        );

        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.8)");

        return gradient;
      };

      // Draw white border
      ctx.strokeStyle = createGradientStroke(ctx, startAngle, endAngle);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label container
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + angle / 2);

      // White rounded rectangle for label
      const labelWidth = 24;
      const labelHeight = 40;
      const labelDistance = radius;

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.roundRect(
        labelDistance - labelWidth - 20,
        -labelHeight / 2 - 5,
        labelWidth,
        labelHeight,
        8
      );
      ctx.fill();

      ctx.translate(labelDistance - labelWidth / 2 - 20, -5);

      ctx.rotate(-Math.PI / 2);

      // Draw text
      ctx.fillStyle = "#2DB15C";
      ctx.font = "bold 8px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const parts = item.value.split("...");
      if (parts.length > 1) {
        ctx.fillText(parts[0] + "...", 0, -3);
        ctx.fillText(parts[1], 0, 4);
      } else {
        ctx.fillText(item.value, 0, 0);
      }

      ctx.restore();
    });

    // Remove shadow for center circle
    ctx.shadowColor = "transparent";

    // Draw center circle
    const centerCircleRadius = 55;
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      centerCircleRadius
    );
    gradient.addColorStop(0, "#86EFAC");
    gradient.addColorStop(1, "#4ADE80");

    ctx.beginPath();
    ctx.arc(centerX, centerY, centerCircleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#262240";
    ctx.lineWidth = 30;
    ctx.stroke();

    // Draw arrow
    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw curved arrow
    ctx.restore();
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
    if (!isSpinning) return;
    console.log("isSpinning", isSpinning);

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
      console.log("targetRotation", targetRotation);

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
      <div className="relative flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="rounded-full"
        />
        <div className="absolute">
          <Image
            src="/arrow-background.svg"
            alt="spin-wheel"
            width={80}
            height={80}
          />
          <Image
            src="/arrow.svg"
            alt="spin-wheel"
            width={50}
            height={50}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
};
