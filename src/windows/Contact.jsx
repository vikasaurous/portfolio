import { WindowControl } from "#components";
import { Mail } from "lucide-react";
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

      <div
        style={{ flex: 1, overflow: "auto" }}
        className="p-6 flex flex-col items-center gap-5 pt-10"
      >
        <img
          src="images/vikas.png"
          alt="vikas"
          className="w-20 h-20 rounded-full object-cover object-top shadow-lg"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
        />
        <div className="text-center space-y-1">
          <h3>Let&apos;s Connect</h3>
          <p>Got an Idea? A bug to squash? Or just wanna talk tech? I&apos;m in.</p>
        </div>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=vikas.yadav.connect@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white hover:underline transition-all text-sm"
        >
          <Mail className="size-4" />
          vikas.yadav.connect@gmail.com
        </a>

        <ul>
          {socials.map(({ id, bg, link, icon, text }) => (
            <li key={id} style={{ background: bg }}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title={text}
              >
                <img src={icon} alt={text} className="size-5" />
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
