import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FrameVideoBackgroundProps {
  frameFolder: string;
  frameCount: number;
  fps?: number;
  className?: string;
  overlayClassName?: string;
}

export const FrameVideoBackground = ({
  frameFolder,
  frameCount,
  fps = 24,
  className,
  overlayClassName,
}: FrameVideoBackgroundProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      // Format number to 3 digits, e.g., 000, 001, ..., 079
      const numStr = i.toString().padStart(3, "0");
      img.src = `${frameFolder}/Generate_dynamic_smooth_video_delpmaspu__${numStr}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          imagesRef.current = images;
          setImagesLoaded(true);
        }
      };
      images.push(img);
    }
  }, [frameFolder, frameCount]);

  // Frame loop
  useEffect(() => {
    if (!imagesLoaded) return;

    let frameId: number;
    let lastTime = performance.now();
    const frameInterval = 1000 / fps;

    const tick = (now: number) => {
      const elapsed = now - lastTime;
      if (elapsed >= frameInterval) {
        lastTime = now - (elapsed % frameInterval);
        setCurrentFrame((prev) => (prev + 1) % frameCount);
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [imagesLoaded, frameCount, fps]);

  // Paint to canvas for best performance
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!imagesLoaded || !imagesRef.current.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const img = imagesRef.current[currentFrame];
    if (!img) return;

    // Need to set canvas dimensions once, based on the first image
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    ctx.drawImage(img, 0, 0);
  }, [currentFrame, imagesLoaded]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-slate-950", className)}>
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-xs">
          Loading HQ Video...
        </div>
      )}
      
      {/* 
        To hide the watermark (which is usually fast in AI generations near bottom right),
        we scale the video slightly and translate it so the edges are cropped, 
        and apply a strong gradient overlay at the bottom.
      */}
      <div className="absolute inset-0 w-full h-full transform scale-105 origin-center">
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            imagesLoaded ? "opacity-30" : "opacity-0" // Kept at lower opacity to act as background
          )}
        />
      </div>

      {/* Primary overlay to ensure text readability and hide bottom text/watermarks */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-background/40" />
      
      {overlayClassName && <div className={cn("absolute inset-0", overlayClassName)} />}
    </div>
  );
};
