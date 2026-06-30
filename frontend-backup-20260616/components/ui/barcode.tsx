/**
 * Barcode — SVG barcode decoration strip
 * Ported from chopinshown/bnoise iOS (Barcode.swift)
 */
import { type FC } from 'react';
import { barcodeBars } from '@/theme/theme';
import { cn } from '@/lib/utils';

interface BarcodeStripProps {
  seed?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const BarcodeStrip: FC<BarcodeStripProps> = ({
  seed = 0x42,
  color = '#121212',
  width = 22,
  height = 80,
  className,
}) => {
  const bars = barcodeBars(width, height, seed);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('flex-shrink-0', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={0}
          width={bar.w}
          height={height}
          fill={color}
        />
      ))}
    </svg>
  );
};

/** Barcode with a serial number beneath it */
export const BarcodeWithNumber: FC<{
  value: string;
  seed?: number;
  color?: string;
  className?: string;
}> = ({ value, seed = 0x42, color = '#121212', className }) => (
  <div className={cn('flex flex-col items-center gap-1', className)}>
    <BarcodeStrip seed={seed} color={color} width={28} height={64} />
    <span
      className="font-mono text-[8px] font-bold tracking-[0.6px]"
      style={{ color, opacity: 0.7 }}
    >
      {value}
    </span>
  </div>
);
