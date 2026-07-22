import{c as f,u as l,s as w,r as c,j as e}from"./index-CADVBJPU.js";import{L as j,C as k,H as v,E as N}from"./index-y1-tkw7m.js";const C=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],_=f("check",C);const T=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],S=f("copy",T),L=({pulse:a})=>e.jsx("div",{style:{animation:a?"safari-icon-pulse 2s ease-in-out infinite":"none"},className:"relative",children:e.jsxs("svg",{width:"72",height:"72",viewBox:"0 0 72 72",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-hidden":"true",children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"safari-bg",x1:"0",y1:"0",x2:"72",y2:"72",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"#34aadc"}),e.jsx("stop",{offset:"100%",stopColor:"#1a7fba"})]}),e.jsxs("linearGradient",{id:"safari-needle-red",x1:"36",y1:"16",x2:"36",y2:"36",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"#ff453a"}),e.jsx("stop",{offset:"100%",stopColor:"#d62828"})]}),e.jsx("filter",{id:"safari-shadow",children:e.jsx("feDropShadow",{dx:"0",dy:"2",stdDeviation:"3",floodColor:"#000",floodOpacity:"0.25"})})]}),e.jsx("rect",{width:"72",height:"72",rx:"16",fill:"url(#safari-bg)"}),e.jsx("circle",{cx:"36",cy:"36",r:"22",stroke:"rgba(255,255,255,0.35)",strokeWidth:"1.5",fill:"none"}),e.jsx("circle",{cx:"36",cy:"36",r:"18",fill:"rgba(255,255,255,0.12)"}),e.jsx("polygon",{points:"36,16 33,36 36,33 39,36",fill:"url(#safari-needle-red)",filter:"url(#safari-shadow)"}),e.jsx("polygon",{points:"36,56 33,36 36,39 39,36",fill:"rgba(255,255,255,0.9)",filter:"url(#safari-shadow)"}),[[36,17.5],[36,54.5],[17.5,36],[54.5,36]].map(([n,i],r)=>e.jsx("circle",{cx:n,cy:i,r:"1.5",fill:"rgba(255,255,255,0.6)"},r))]})}),B=({url:a})=>{const[n,i]=c.useState(!1);let r="";try{r=new URL(a).hostname}catch{}return r?e.jsx("img",{src:`https://www.google.com/s2/favicons?domain=${r}&sz=32`,alt:"","aria-hidden":"true",onLoad:()=>i(!0),className:"w-5 h-5 rounded-sm",style:{opacity:n?1:0,transition:"opacity 0.2s"}}):null},E=({onClick:a,children:n})=>e.jsxs("button",{type:"button",onClick:a,className:`
      flex items-center justify-center gap-2
      w-full px-5 py-2.5
      bg-blue-500 hover:bg-blue-600 active:bg-blue-700
      text-white text-[13px] font-semibold rounded-xl
      transition-all duration-150 cursor-pointer
      shadow-[0_1px_3px_rgba(0,118,255,0.4)]
      hover:shadow-[0_3px_10px_rgba(0,118,255,0.45)]
      hover:-translate-y-px active:translate-y-0
    `,"aria-label":"Open in new tab",children:[e.jsx(N,{className:"w-3.5 h-3.5 shrink-0",strokeWidth:2.5}),"Open in New Tab"]}),d=({onClick:a,icon:n,children:i,id:r})=>e.jsxs("button",{type:"button",id:r,onClick:a,className:`
      flex items-center justify-center gap-1.5
      px-4 py-2
      bg-white/60 dark:bg-white/[0.08]
      hover:bg-white/80 dark:hover:bg-white/[0.13]
      active:bg-white/40 dark:active:bg-white/[0.05]
      text-gray-700 dark:text-gray-300
      text-[12px] font-medium
      rounded-lg border border-gray-200/80 dark:border-white/[0.12]
      transition-all duration-150 cursor-pointer
      hover:-translate-y-px active:translate-y-0
    `,children:[e.jsx(n,{className:"w-3.5 h-3.5 shrink-0",strokeWidth:2}),i]}),P=({url:a})=>{const n=l(s=>s.goBack),i=l(s=>s.goHome),r=l(w),[x,o]=c.useState(!1),[p,u]=c.useState(!1),[y,g]=c.useState(!1);c.useEffect(()=>{const s=setTimeout(()=>u(!0),30),t=setTimeout(()=>g(!0),600);return()=>{clearTimeout(s),clearTimeout(t)}},[]);let h="",m=!1;try{const s=new URL(a);h=s.hostname,m=s.protocol==="https:"}catch{}const b=()=>{const s=a;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(s).then(()=>{o(!0),setTimeout(()=>o(!1),2e3)}).catch(()=>{try{const t=document.createElement("textarea");t.value=s,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.focus(),t.select(),document.execCommand("copy"),document.body.removeChild(t)}catch{}o(!0),setTimeout(()=>o(!1),2e3)});else{try{const t=document.createElement("textarea");t.value=s,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.focus(),t.select(),document.execCommand("copy"),document.body.removeChild(t)}catch{}o(!0),setTimeout(()=>o(!1),2e3)}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @keyframes safari-notice-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes safari-icon-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(52,170,220,0)); }
          50%       { transform: scale(1.06); filter: drop-shadow(0 0 8px rgba(52,170,220,0.5)); }
        }
        @keyframes safari-bg-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}),e.jsx("div",{className:`
          absolute inset-0 flex items-center justify-center
          bg-[#f2f2f7]/80 dark:bg-[#1c1c1e]/80
          backdrop-blur-[20px]
        `,style:{opacity:p?1:0,transition:"opacity 0.35s ease"},children:e.jsxs("div",{className:`
            relative w-[380px] max-w-[92vw]
            bg-white/70 dark:bg-[#2c2c2e]/75
            backdrop-blur-[40px]
            rounded-2xl
            border border-white/60 dark:border-white/[0.1]
            shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)]
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]
            overflow-hidden
          `,style:{animation:p?"safari-notice-in 0.32s cubic-bezier(0.22,1,0.36,1) forwards":"none"},role:"region","aria-label":"Page can't be displayed",children:[e.jsx("div",{className:"absolute top-0 left-0 right-0 h-px",style:{background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"},"aria-hidden":"true"}),e.jsxs("div",{className:"px-8 py-8 flex flex-col items-center text-center",children:[e.jsx("div",{className:"mb-5",children:e.jsx(L,{pulse:y})}),e.jsx("h2",{className:`
                text-[17px] font-semibold leading-snug
                text-gray-900 dark:text-gray-50
                mb-3
              `,style:{letterSpacing:"-0.01em"},children:"This page can't be displayed in Safari"}),e.jsx("p",{className:"text-[13px] leading-[1.55] text-gray-500 dark:text-gray-400 mb-6 max-w-[300px]",children:"This website prevents itself from being opened inside embedded browsers. This is a security policy defined by the website, not an issue with your device."}),e.jsxs("div",{className:`
                w-full mb-6 rounded-xl overflow-hidden
                divide-y divide-gray-100 dark:divide-white/[0.06]
                border border-gray-100 dark:border-white/[0.07]
                bg-gray-50/60 dark:bg-black/[0.15]
              `,children:[e.jsxs("div",{className:"flex items-center gap-2.5 px-4 py-2.5",children:[e.jsx(B,{url:a}),e.jsx("span",{className:"flex-1 text-[11.5px] text-gray-500 dark:text-gray-400 truncate font-mono text-left",children:a})]}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-2",children:[e.jsx("span",{className:"text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider",children:"Domain"}),e.jsx("span",{className:"text-[12px] text-gray-700 dark:text-gray-300 font-medium",children:h})]}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-2",children:[e.jsx("span",{className:"text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider",children:"Connection"}),e.jsx("span",{className:"flex items-center gap-1.5 text-[12px] font-medium",children:m?e.jsxs(e.Fragment,{children:[e.jsx(j,{className:"w-3 h-3 text-green-500",strokeWidth:2.5}),e.jsx("span",{className:"text-green-600 dark:text-green-400",children:"HTTPS Secure"})]}):e.jsx("span",{className:"text-gray-500 dark:text-gray-400",children:"HTTP"})})]})]}),e.jsx("div",{className:"w-full mb-3",children:e.jsx(E,{onClick:()=>window.open(a,"_blank","noopener,noreferrer"),children:"Open in New Tab"})}),e.jsxs("div",{className:"flex items-center gap-2 w-full justify-center",children:[e.jsx(d,{id:"safari-notice-copy",onClick:b,icon:x?_:S,children:x?"Copied!":"Copy Link"}),e.jsx(d,{id:"safari-notice-back",onClick:()=>r?n():i(),icon:k,children:"Go Back"}),e.jsx(d,{id:"safari-notice-home",onClick:i,icon:v,children:"Home"})]})]})]})})]})};export{P as default};
