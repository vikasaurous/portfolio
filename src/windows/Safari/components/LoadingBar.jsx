import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Progress simulation stages — mimics Safari's indeterminate loading feel
const STAGES = [
  { to: 0.15, dur: 0.25 },
  { to: 0.40, dur: 0.45 },
  { to: 0.70, dur: 0.70 },
  { to: 0.85, dur: 1.20 },   // stalls before server response
];

const LoadingBar = ({ status }) => {
  const barRef = useRef(null);
  const tlRef  = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    if (status === 'loading') {
      tlRef.current?.kill();
      gsap.set(bar, { scaleX: 0, opacity: 1, transformOrigin: 'left center' });

      const tl = gsap.timeline();
      let elapsed = 0;
      STAGES.forEach(({ to, dur }) => {
        tl.to(bar, { scaleX: to, duration: dur, ease: 'power1.out' }, elapsed);
        elapsed += dur;
      });
      tlRef.current = tl;

    } else if (status === 'loaded' || status === 'error') {
      tlRef.current?.kill();
      gsap.to(bar, {
        scaleX: 1,
        duration: 0.18,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(bar, { opacity: 0, duration: 0.28, delay: 0.08 });
        },
      });
    }
  }, [status]);

  return (
    <div
      ref={barRef}
      style={{ transformOrigin: 'left center' }}
      className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 z-50 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default LoadingBar;
