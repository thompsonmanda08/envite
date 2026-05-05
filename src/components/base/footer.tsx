import React from "react";

function Footer() {
  return (
    <footer className="text-center pt-20 pb-12">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6" />
        <p className="text-gray-400 text-sm font-light tracking-wide mb-4">
          Crafted with care, delivered with love
        </p>
        <p className="text-xs text-gray-300 tracking-wider">
          POWERED BY{" "}
          <span className="font-medium">
            XCLSV<span className="text-purple-400">.SHOP</span>
          </span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
