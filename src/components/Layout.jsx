// components/Layout.jsx
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <main className="p-6 bg-gray-100 min-h-screen">{children}</main>
    </div>
  );
};

export default Layout;
