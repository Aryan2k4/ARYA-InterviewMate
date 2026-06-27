import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
    <Sidebar />
    <main className="page-content">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </main>
  </div>
);
