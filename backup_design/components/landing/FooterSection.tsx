/**
 * Footer Section - Dynamic Landing Page Component
 */

import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Github, Mail, Phone, MapPin } from 'lucide-react';
import { LandingFooterSettings } from '../../types';

interface FooterSectionProps {
  data: LandingFooterSettings;
  logo?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ data, logo }) => {
  // Sort links by order
  const sortedLinks = [...data.links].sort((a, b) => a.order - b.order);

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            {logo ? (
              <img src={logo} alt={data.companyName} className="h-10 mb-4" />
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {data.companyName.charAt(0)}
                </div>
                <span className="text-2xl font-bold text-white">{data.companyName}</span>
              </div>
            )}
            <p className="text-gray-400 mb-4">{data.tagline}</p>

            {/* Social Links */}
            {(data.social.facebook ||
              data.social.instagram ||
              data.social.twitter ||
              data.social.linkedin ||
              data.social.github) && (
              <div className="flex gap-4">
                {Object.entries(data.social).map(([platform, url]) => {
                  if (!url) {
                    return null;
                  }
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  if (!Icon) {
                    return null;
                  }

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition"
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {data.contact.email && (
                <li className="flex items-center gap-2">
                  <Mail size={16} />
                  <a href={`mailto:${data.contact.email}`} className="hover:text-white transition">
                    {data.contact.email}
                  </a>
                </li>
              )}
              {data.contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={16} />
                  <a href={`tel:${data.contact.phone}`} className="hover:text-white transition">
                    {data.contact.phone}
                  </a>
                </li>
              )}
              {data.contact.address && (
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-1 flex-shrink-0" />
                  <span>{data.contact.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Links */}
          {sortedLinks.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-4">Links</h4>
              <ul className="space-y-3">
                {sortedLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} className="hover:text-white transition">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>{data.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
