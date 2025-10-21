import CloverIcon from './CloverIcon';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Updates', href: '#' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    resources: [
      { label: 'Documentation', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Community', href: '#' },
    ],
  };

  return (
    <footer className="neuro-bg border-t border-[#d0d0d0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <a href="/" className="neuro-card rounded-xl w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#8EB69B]">
                <CloverIcon size={24} className="text-[#8EB69B]" />
              </a>
              <span className="text-[#333]">Dashboard</span>
            </div>
            <p className="text-[#666] mb-4">
              A beautiful neumorphic design system for modern web applications.
            </p>
            <div className="flex gap-3">
              <button className="neuro-button rounded-xl w-10 h-10 flex items-center justify-center">
                <i className="bx bxl-twitter text-lg text-[#8EB69B]"></i>
              </button>
              <button className="neuro-button rounded-xl w-10 h-10 flex items-center justify-center">
                <i className="bx bxl-github text-lg text-[#8EB69B]"></i>
              </button>
              <button className="neuro-button rounded-xl w-10 h-10 flex items-center justify-center">
                <i className="bx bxl-linkedin text-lg text-[#8EB69B]"></i>
              </button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-[#333] mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#666] hover:text-[#8EB69B] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[#333] mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#666] hover:text-[#8EB69B] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-[#333] mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#666] hover:text-[#8EB69B] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#d0d0d0]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[#666]">
              © {currentYear} Dashboard. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[#666] hover:text-[#8EB69B] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-[#666] hover:text-[#8EB69B] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
