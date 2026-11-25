import{c as b,u as l,s as w,r as c,j as e,C as j}from"./index-Ddn3VKMn.js";import{L as k,C as v,H as N,E as C}from"./index-DBqwzk_t.js";const _=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],T=b("copy",_),S=({pulse:r})=>e.jsx("div",{style:{animation:r?"safari-icon-pulse 2s ease-in-out infinite":"none"},className:"relative",children:e.jsxs("svg",{width:"72",height:"72",viewBox:"0 0 72 72",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-hidden":"true",children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"safari-bg",x1:"0",y1:"0",x2:"72",y2:"72",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"#34aadc"}),e.jsx("stop",{offset:"100%",stopColor:"#1a7fba"})]}),e.jsxs("linearGradient",{id:"safari-needle-red",x1:"36",y1:"16",x2:"36",y2:"36",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"#ff453a"}),e.jsx("stop",{offset:"100%",stopColor:"#d62828"})]}),e.jsx("filter",{id:"safari-shadow",children:e.jsx("feDropShadow",{dx:"0",dy:"2",stdDeviation:"3",floodColor:"#000",floodOpacity:"0.25"})})]}),e.jsx("rect",{width:"72",height:"72",rx:"16",fill:"url(#safari-bg)"}),e.jsx("circle",{cx:"36",cy:"36",r:"22",stroke:"rgba(255,255,255,0.35)",strokeWidth:"1.5",fill:"none"}),e.jsx("circle",{cx:"36",cy:"36",r:"18",fill:"rgba(255,255,255,0.12)"}),e.jsx("polygon",{points:"36,16 33,36 36,33 39,36",fill:"url(#safari-needle-red)",filter:"url(#safari-shadow)"}),e.jsx("polygon",{points:"36,56 33,36 36,39 39,36",fill:"rgba(255,255,255,0.9)",filter:"url(#safari-shadow)"}),[[36,17.5],[36,54.5],[17.5,36],[54.5,36]].map(([n,i],s)=>e.jsx("circle",{cx:n,cy:i,r:"1.5",fill:"rgba(255,255,255,0.6)"},s))]})}),L=({url:r})=>{const[n,i]=c.useState(!1);let s="";try{s=new URL(r).hostname}catch{}return s?e.jsx("img",{src:`https://www.google.com/s2/favicons?domain=${s}&sz=32`,alt:"","aria-hidden":"true",onLoad:()=>i(!0),className:"w-5 h-5 rounded-sm",style:{opacity:n?1:0,transition:"opacity 0.2s"}}):null},B=({onClick:r,children:n})=>e.jsxs("button",{type:"button",onClick:r,className:`\r
      flex items-center justify-center gap-2\r
      w-full px-5 py-2.5\r
      bg-blue-500 hover:bg-blue-600 active:bg-blue-700\r
      text-white text-[13px] font-semibold rounded-xl\r
      transition-all duration-150 cursor-pointer\r
      shadow-[0_1px_3px_rgba(0,118,255,0.4)]\r
      hover:shadow-[0_3px_10px_rgba(0,118,255,0.45)]\r
      hover:-translate-y-px active:translate-y-0\r
    `,"aria-label":"Open in new tab",children:[e.jsx(C,{className:"w-3.5 h-3.5 shrink-0",strokeWidth:2.5}),"Open in New Tab"]}),d=({onClick:r,icon:n,children:i,id:s})=>e.jsxs("button",{type:"button",id:s,onClick:r,className:`\r
      flex items-center justify-center gap-1.5\r
      px-4 py-2\r
      bg-white/60 dark:bg-white/[0.08]\r
      hover:bg-white/80 dark:hover:bg-white/[0.13]\r
      active:bg-white/40 dark:active:bg-white/[0.05]\r
      text-gray-700 dark:text-gray-300\r
      text-[12px] font-medium\r
      rounded-lg border border-gray-200/80 dark:border-white/[0.12]\r
      transition-all duration-150 cursor-pointer\r
      hover:-translate-y-px active:translate-y-0\r
    `,children:[e.jsx(n,{className:"w-3.5 h-3.5 shrink-0",strokeWidth:2}),i]}),O=({url:r})=>{const n=l(a=>a.goBack),i=l(a=>a.goHome),s=l(w),[x,o]=c.useState(!1),[p,f]=c.useState(!1),[u,y]=c.useState(!1);c.useEffect(()=>{const a=setTimeout(()=>f(!0),30),t=setTimeout(()=>y(!0),600);return()=>{clearTimeout(a),clearTimeout(t)}},[]);let h="",m=!1;try{const a=new URL(r);h=a.hostname,m=a.protocol==="https:"}catch{}const g=()=>{const a=r;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(a).then(()=>{o(!0),setTimeout(()=>o(!1),2e3)}).catch(()=>{try{const t=document.createElement("textarea");t.value=a,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.focus(),t.select(),document.execCommand("copy"),document.body.removeChild(t)}catch{}o(!0),setTimeout(()=>o(!1),2e3)});else{try{const t=document.createElement("textarea");t.value=a,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.focus(),t.select(),document.execCommand("copy"),document.body.removeChild(t)}catch{}o(!0),setTimeout(()=>o(!1),2e3)}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
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
      `}),e.jsx("div",{className:`\r
          absolute inset-0 flex items-center justify-center\r
          bg-[#f2f2f7]/80 dark:bg-[#1c1c1e]/80\r
          backdrop-blur-[20px]\r
        `,style:{opacity:p?1:0,transition:"opacity 0.35s ease"},children:e.jsxs("div",{className:`\r
            relative w-[380px] max-w-[92vw]\r
            bg-white/70 dark:bg-[#2c2c2e]/75\r
            backdrop-blur-[40px]\r
            rounded-2xl\r
            border border-white/60 dark:border-white/[0.1]\r
            shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)]\r
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]\r
            overflow-hidden\r
          `,style:{animation:p?"safari-notice-in 0.32s cubic-bezier(0.22,1,0.36,1) forwards":"none"},role:"region","aria-label":"Page can't be displayed",children:[e.jsx("div",{className:"absolute top-0 left-0 right-0 h-px",style:{background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"},"aria-hidden":"true"}),e.jsxs("div",{className:"px-8 py-8 flex flex-col items-center text-center",children:[e.jsx("div",{className:"mb-5",children:e.jsx(S,{pulse:u})}),e.jsx("h2",{className:`\r
                text-[17px] font-semibold leading-snug\r
                text-gray-900 dark:text-gray-50\r
                mb-3\r
              `,style:{letterSpacing:"-0.01em"},children:"This page can't be displayed in Safari"}),e.jsx("p",{className:"text-[13px] leading-[1.55] text-gray-500 dark:text-gray-400 mb-6 max-w-[300px]",children:"This website prevents itself from being opened inside embedded browsers. This is a security policy defined by the website, not an issue with your device."}),e.jsxs("div",{className:`\r
                w-full mb-6 rounded-xl overflow-hidden\r
                divide-y divide-gray-100 dark:divide-white/[0.06]\r
                border border-gray-100 dark:border-white/[0.07]\r
                bg-gray-50/60 dark:bg-black/[0.15]\r
              `,children:[e.jsxs("div",{className:"flex items-center gap-2.5 px-4 py-2.5",children:[e.jsx(L,{url:r}),e.jsx("span",{className:"flex-1 text-[11.5px] text-gray-500 dark:text-gray-400 truncate font-mono text-left",children:r})]}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-2",children:[e.jsx("span",{className:"text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider",children:"Domain"}),e.jsx("span",{className:"text-[12px] text-gray-700 dark:text-gray-300 font-medium",children:h})]}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-2",children:[e.jsx("span",{className:"text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider",children:"Connection"}),e.jsx("span",{className:"flex items-center gap-1.5 text-[12px] font-medium",children:m?e.jsxs(e.Fragment,{children:[e.jsx(k,{className:"w-3 h-3 text-green-500",strokeWidth:2.5}),e.jsx("span",{className:"text-green-600 dark:text-green-400",children:"HTTPS Secure"})]}):e.jsx("span",{className:"text-gray-500 dark:text-gray-400",children:"HTTP"})})]})]}),e.jsx("div",{className:"w-full mb-3",children:e.jsx(B,{onClick:()=>window.open(r,"_blank","noopener,noreferrer"),children:"Open in New Tab"})}),e.jsxs("div",{className:"flex items-center gap-2 w-full justify-center",children:[e.jsx(d,{id:"safari-notice-copy",onClick:g,icon:x?j:T,children:x?"Copied!":"Copy Link"}),e.jsx(d,{id:"safari-notice-back",onClick:()=>s?n():i(),icon:v,children:"Go Back"}),e.jsx(d,{id:"safari-notice-home",onClick:i,icon:N,children:"Home"})]})]})]})})]})};export{O as default};
