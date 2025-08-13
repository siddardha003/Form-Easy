import React from 'react';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github,
  Heart,
  Smile
} from 'lucide-react';

const Footer = () => {
  const links = [
    {
      title: 'Product',
      items: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Templates', href: '#templates' }
      ],
    },
    {
      title: 'Company',
      items: [
        { name: 'About Us', href: '#about' },
        { name: 'Blog', href: '#blog' },
        { name: 'Careers', href: '#careers' }
      ],
    },
    {
      title: 'Help',
      items: [
        { name: 'Support', href: '#support' },
        { name: 'Guides', href: '#guides' },
        { name: 'API Docs', href: '#api' }
      ],
    },
    {
      title: 'Legal',
      items: [
        { name: 'Privacy', href: '#privacy' },
        { name: 'Terms', href: '#terms' },
        { name: 'Cookies', href: '#cookies' }
      ],
    },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-br from-blue-50 to-white text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main content */}
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Smile className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                BustBrain Labs
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              Making form building powerful and intuitive for businesses.
            </p>
            
            {/* Social links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 rounded-full bg-white text-blue-500 hover:bg-blue-50 transition-colors shadow-sm border border-blue-100"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {links.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>{item.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Heart className="w-4 h-4 fill-current text-blue-500" />
            <span className="text-sm">
              Made with love in San Francisco
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} BustBrain Labs. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;