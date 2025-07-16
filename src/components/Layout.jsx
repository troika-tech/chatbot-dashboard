// src/components/Layout.jsx
import React from "react";
import Header from "./Header";
import Sidebar from "./UserSidebar";

export default function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
