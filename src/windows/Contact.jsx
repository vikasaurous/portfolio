import { WindowControl } from "#components";
import { Mail, ArrowUpRight } from "lucide-react";
import { socials } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import React from "react";

const Contact = () => {
  return (
    <>
      <div id="window-header">
        <WindowControl target="contact" />
        <h2>Contact Me</h2>
      </div>

      <div className="contact-body p-6 flex flex-col items-center gap-5 pt-9">
        <img
          src="images/vikas.webp"
          alt="vikas"
          className="w-20 h-20 rounded-full object-cover object-top ring-2 ring-white/60 dark:ring-white/20 shadow-lg"
          style={{ boxShadow: "0 6px 22px rgba(0,0,0,0.22)" }}
        />
        <div className="text-center space-y-1">
          <h3>Let&apos;s Connect</h3>
          <p>Got an Idea? A bug to squash? Or just wanna talk tech? I&apos;m in.</p>
        </div>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=vikas.yadav.connect@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="lg-pill px-4 py-1.5 text-xs font-medium"
        >
          <Mail className="size-3.5" />
          vikas.yadav.connect@gmail.com
        </a>

        <ul>
          {socials.map(({ id, bg, link, icon, text }) => (
            <li key={id} className="lg-card group">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title={text}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="contact-icon-badge" style={{ background: bg }}>
                    <img src={icon} alt="" aria-hidden="true" className="size-4 object-contain" />
                  </span>
                  <ArrowUpRight className="contact-ext-arrow size-3.5" aria-hidden="true" />
                </div>
                <p>{text}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const ContactWindow = WindowWrapper(Contact, "contact");
export default ContactWindow;
