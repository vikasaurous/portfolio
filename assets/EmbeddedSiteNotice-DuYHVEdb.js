import{e as j,d as c,s as w,r,j as e,C as k}from"./index-0W-izxAP.js";import{L as v,C as N,H as C,E as S}from"./index-C88ts5X4.js";import"./WindowControl-C4zq1ngR.js";const T=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],L=j("copy",T),_=({pulse:t})=>e.jsx("div",{style:{animation:t?"safari-icon-pulse 2s ease-in-out infinite":"none"},className:"relative",children:e.jsxs("svg",{width:"72",height:"72",viewBox:"0 0 72 72",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-hidden":"true",children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"safari-bg",x1:"0",y1:"0",x2:"72",y2:"72",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"#34aadc"}),e.jsx("stop",{offset:"100%",stopColor:"#1a7fba"})]}),e.jsxs("linearGradient",{id:"safari-needle-red",x1:"36",y1:"16",x2:"36",y2:"36",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"#ff453a"}),e.jsx("stop",{offset:"100%",stopColor:"#d62828"})]}),e.jsx("filter",{id:"safari-shadow",children:e.jsx("feDropShadow",{dx:"0",dy:"2",stdDeviation:"3",floodColor:"#000",floodOpacity:"0.25"})})]}),e.jsx("rect",{width:"72",height:"72",rx:"16",fill:"url(#safari-bg)"}),e.jsx("circle",{cx:"36",cy:"36",r:"22",stroke:"rgba(255,255,255,0.35)",strokeWidth:"1.5",fill:"none"}),e.jsx("circle",{cx:"36",cy:"36",r:"18",fill:"rgba(255,255,255,0.12)"}),e.jsx("polygon",{points:"36,16 33,36 36,33 39,36",fill:"url(#safari-needle-red)",filter:"url(#safari-shadow)"}),e.jsx("polygon",{points:"36,56 33,36 36,39 39,36",fill:"rgba(255,255,255,0.9)",filter:"url(#safari-shadow)"}),[[36,17.5],[36,54.5],[17.5,36],[54.5,36]].map(([s,i],n)=>e.jsx("circle",{cx:s,cy:i,r:"1.5",fill:"rgba(255,255,255,0.6)"},n))]})}),B=({url:t})=>{const[s,i]=r.useState(!1);let n="";try{n=new URL(t).hostname}catch{}return n?e.jsx("img",{src:`https://www.google.com/s2/favicons?domain=${n}&sz=32`,alt:"","aria-hidden":"true",onLoad:()=>i(!0),className:"w-5 h-5 rounded-sm",style:{opacity:s?1:0,transition:"opacity 0.2s"}}):null},E=({onClick:t,children:s})=>e.jsxs("button",{type:"button",onClick:t,className:`
      flex items-center justify-center gap-2
      w-full px-5 py-2.5
      bg-[#0a84ff] hover:bg-[#0071e3] active:bg-[#005bb5]
      text-white text-[13px] font-semibold rounded-full
      transition-all duration-150 cursor-pointer
      shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_14px_rgba(10,132,255,0.38)]
      hover:-translate-y-px active:translate-y-0
    `,"aria-label":"Open in new tab",children:[e.jsx(S,{className:"w-3.5 h-3.5 shrink-0",strokeWidth:2.5}),s]}),l=({onClick:t,icon:s,children:i,id:n})=>{const o=s;return e.jsxs("button",{type:"button",id:n,onClick:t,className:"lg-pill px-4 py-2 text-[12px] font-medium cursor-pointer",children:[e.jsx(o,{className:"w-3.5 h-3.5 shrink-0",strokeWidth:2}),i]})};function m(t){try{const s=document.createElement("textarea");s.value=t,s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.focus(),s.select(),document.execCommand("copy"),document.body.removeChild(s)}catch{}}const G=({url:t})=>{const s=c(a=>a.goBack),i=c(a=>a.goHome),n=c(w),[o,d]=r.useState(!1),[x,h]=r.useState(!1),[u,y]=r.useState(!1);r.useEffect(()=>{const a=setTimeout(()=>h(!0),30),b=setTimeout(()=>y(!0),600);return()=>{clearTimeout(a),clearTimeout(b)}},[]);let p="",f=!1;try{const a=new URL(t);p=a.hostname,f=a.protocol==="https:"}catch{}const g=()=>{const a=()=>{d(!0),setTimeout(()=>d(!1),2e3)};navigator.clipboard?.writeText?navigator.clipboard.writeText(t).then(a).catch(()=>{m(t),a()}):(m(t),a())};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
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
          bg-transparent
        `,style:{opacity:x?1:0,transition:"opacity 0.35s ease"},children:e.jsxs("div",{className:`
            lg-popover relative w-[380px] max-w-[92vw]
            rounded-[22px]
            overflow-hidden
          `,style:{animation:x?"safari-notice-in 0.32s cubic-bezier(0.22,1,0.36,1) forwards":"none"},role:"region","aria-label":"Page can't be displayed",children:[e.jsx("div",{className:"absolute top-0 left-0 right-0 h-px",style:{background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"},"aria-hidden":"true"}),e.jsxs("div",{className:"px-8 py-8 flex flex-col items-center text-center",children:[e.jsx("div",{className:"mb-5",children:e.jsx(_,{pulse:u})}),e.jsx("h2",{className:`
                text-[17px] font-semibold leading-snug
                text-gray-900 dark:text-gray-50
                mb-3
              `,style:{letterSpacing:"-0.01em"},children:"This page can't be displayed in Safari"}),e.jsx("p",{className:"text-[13px] leading-[1.55] text-gray-600 dark:text-gray-300/80 mb-6 max-w-[300px]",children:"This website prevents itself from being opened inside embedded browsers. This is a security policy defined by the website, not an issue with your device."}),e.jsxs("div",{className:`
                w-full mb-6 rounded-xl overflow-hidden
                divide-y divide-black/[0.06] dark:divide-white/[0.07]
                border border-black/[0.07] dark:border-white/[0.08]
                bg-black/[0.03] dark:bg-white/[0.05]
              `,children:[e.jsxs("div",{className:"flex items-center gap-2.5 px-4 py-2.5",children:[e.jsx(B,{url:t}),e.jsx("span",{className:"flex-1 text-[11.5px] text-gray-500 dark:text-gray-400 truncate font-mono text-left",children:t})]}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-2",children:[e.jsx("span",{className:"text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider",children:"Domain"}),e.jsx("span",{className:"text-[12px] text-gray-700 dark:text-gray-300 font-medium",children:p})]}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-2",children:[e.jsx("span",{className:"text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider",children:"Connection"}),e.jsx("span",{className:"flex items-center gap-1.5 text-[12px] font-medium",children:f?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"w-3 h-3 text-green-500",strokeWidth:2.5}),e.jsx("span",{className:"text-green-600 dark:text-green-400",children:"HTTPS Secure"})]}):e.jsx("span",{className:"text-gray-500 dark:text-gray-400",children:"HTTP"})})]})]}),e.jsx("div",{className:"w-full mb-3",children:e.jsx(E,{onClick:()=>window.open(t,"_blank","noopener,noreferrer"),children:"Open in New Tab"})}),e.jsxs("div",{className:"flex items-center gap-2 w-full justify-center",children:[e.jsx(l,{id:"safari-notice-copy",onClick:g,icon:o?k:L,children:o?"Copied!":"Copy Link"}),e.jsx(l,{id:"safari-notice-back",onClick:()=>n?s():i(),icon:N,children:"Go Back"}),e.jsx(l,{id:"safari-notice-home",onClick:i,icon:C,children:"Home"})]})]})]})})]})};export{G as default};
