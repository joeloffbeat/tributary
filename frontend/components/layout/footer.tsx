'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Droplets,
  Twitter,
  Github,
  MessageCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  product: [
    { label: 'Marketplace', href: '/tributary' },
    { label: 'Create Vault', href: '/tributary/create' },
    { label: 'Portfolio', href: '/tributary/portfolio' },
    { label: 'Secondary Market', href: '/tributary/trade' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs', external: true },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'FAQ', href: '/faq' },
    { label: 'API Reference', href: '/api-docs', external: true },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog', external: true },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Risk Disclosure', href: '/risks' },
  ],
}

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/tributary', label: 'Twitter' },
  { icon: MessageCircle, href: 'https://discord.gg/tributary', label: 'Discord' },
  { icon: Github, href: 'https://github.com/tributary', label: 'GitHub' },
]

export function Footer() {
  return (
    <footer className="bg-river-950 border-t border-river-800">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/tributary" className="flex items-center gap-2 mb-4">
              <Droplets className="h-8 w-8 text-tributary-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-tributary-400 to-cyan-400 bg-clip-text text-transparent">
                Tributary
              </span>
            </Link>
            <p className="text-river-400 text-sm mb-6 max-w-xs">
              Tokenize IP royalties. Invest in creator success. Built on Story Protocol.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Stay Updated</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-river-900/50 border-river-700 flex-1"
                />
                <Button size="icon" className="bg-tributary-500 hover:bg-tributary-600">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          <FooterLinkColumn title="Product" links={footerLinks.product} />
          <FooterLinkColumn title="Resources" links={footerLinks.resources} />
          <FooterLinkColumn title="Company" links={footerLinks.company} />
          <FooterLinkColumn title="Legal" links={footerLinks.legal} />
        </div>

        <Separator className="my-8 bg-river-800" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-river-500">
            <span>&copy; {new Date().getFullYear()} Tributary. All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              Built on
              <a
                href="https://story.foundation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tributary-400 hover:text-tributary-300 transition-colors"
              >
                Story Protocol
              </a>
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-river-800/50 hover:bg-river-700/50 text-river-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: FooterLink[]
}) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-river-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-river-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
