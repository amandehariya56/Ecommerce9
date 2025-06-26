// src/components/layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
      © {new Date().getFullYear()} My Admin Panel. All rights reserved.
    </footer>
  );
}
