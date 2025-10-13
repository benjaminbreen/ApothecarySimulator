import React, { useState, useRef } from 'react';
import './NavMobile.css';
import { useClickAway } from "react-use";
import { AnimatePresence, motion } from "framer-motion";
import { Squash as Hamburger } from "hamburger-react";

const NavMobile = ({ setIsDarkMode, setIsAboutOpen }) => {
  const [isOpen, setOpen] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, () => setOpen(false));

  const menuItems = [
    { title: "About", action: () => setIsAboutOpen(true) },
    { title: "Toggle Dark Mode", action: () => setIsDarkMode(prev => !prev) },
  ];

  return (
    <div ref={ref} className="nav-mobile">
      <Hamburger toggled={isOpen} size={25} toggle={setOpen} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="menu-container"
          >
            <ul className="menu-list">
              {menuItems.map((item, idx) => (
                <motion.li
                  key={item.title}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 22,
                    delay: 0.06 + idx / 20,
                  }}
                  className="menu-item"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      className="menu-link"
                      onClick={() => setOpen(false)}
                    >
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        item.action();
                        setOpen(false);
                      }}
                      className="menu-button"
                    >
                      <span>{item.title}</span>
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavMobile;