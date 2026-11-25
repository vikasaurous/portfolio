import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const FONT_WEIGHTS = {
  subtitle: { min: 100, max: 400, default: 100},
  title: { min: 400, max: 900, default: 400},
}

const renderText = (text, className, baseWeight = 400) => {
  return [...text].map((char, index) => (
    <span
      key={index}
      className={className}
      style={{
        fontVariationSettings: `'wght' ${baseWeight}` // ✅ Fixed typo
      }}
    >{char === " " ? "\u00A0" : char}</span>
  ))
}

const setupTextHover = (container, type) => {
  if (!container) return () => {};

  const letters = Array.from(container.querySelectorAll("span"));
  const { min, max, default: base } = FONT_WEIGHTS[type];

  const proxies = letters.map((letter) => {
    const proxy = { w: base };
    const setWeight = gsap.quickTo(proxy, "w", {
      duration: 0.25,
      ease: "power2.out",
      onUpdate: () => {
        letter.style.fontVariationSettings = `'wght' ${Math.round(proxy.w)}`;
      },
    });
    return { proxy, setWeight };
  });

  let containerLeft = 0;
  let letterCenters = [];
  let disposed = false;

  const measure = () => {
    if (disposed) return;
    containerLeft = container.getBoundingClientRect().left;
    letterCenters = letters.map((letter) => {
      const { left, width } = letter.getBoundingClientRect();
      return left - containerLeft + width / 2;
    });
  };

  measure();
  document.fonts?.ready?.then(measure);

  const handleMouseMove = (e) => {
    if (letterCenters.length === 0) measure();
    const mouseX = e.clientX - containerLeft;

    for (let i = 0; i < letters.length; i++) {
      const distance = Math.abs(mouseX - letterCenters[i]);
      const intensity = Math.exp(-(distance ** 2) / 20000);
      proxies[i].setWeight(min + (max - min) * intensity);
    }
  };

  const handleMouseLeave = () => {
    for (let i = 0; i < proxies.length; i++) {
      proxies[i].setWeight(base);
    }
  };

  container.addEventListener("mouseenter", measure);
  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseleave", handleMouseLeave);
  window.addEventListener("resize", measure);

  return () => {
    disposed = true;
    container.removeEventListener("mouseenter", measure);
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseleave", handleMouseLeave);
    window.removeEventListener("resize", measure);
    gsap.killTweensOf(proxies.map((p) => p.proxy));
  };
};
const Welcome = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useGSAP(() => {
    const titleCleanUp = setupTextHover(titleRef.current, "title")
    const subtitleCleanUp = setupTextHover(subtitleRef.current, "subtitle")
  
    return () => {
      titleCleanUp()
      subtitleCleanUp()
    }
  }, [])

  return (
    <section id='welcome'>
      <p ref={subtitleRef}>{
         renderText("Hey, I'm Vikas! Welcome to my", "text-3xl font-georama", 100)
        }</p>
      <h1 ref={titleRef} className='mt-7'>{
          renderText("portfolio.", "text-9xl italic font-georama")
        }</h1>

      <div className="small-screen">
        <p>This portfolio is designed for desktop/tablet screens only.</p>
      </div>
      
    </section>
  )
}

export default Welcome