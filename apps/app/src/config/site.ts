import { Activity, FolderKanban, type LucideIcon, Settings2 } from 'lucide-react';

export const siteConfig = {
  name: 'SaaS Boilerplate',
  description: 'Full-stack SaaS boilerplate with Next.js, Fastify, and Prisma',
  url: 'http://localhost:3000',
};

export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    disabled?: boolean;
  }[];
};

export const dashboardNav: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Activity,
    isActive: true,
    items: [
      { title: 'Overview', url: '/' },
      { title: 'Analytics', url: '#', disabled: true },
    ],
  },
  {
    title: 'Projects',
    url: '/projects',
    icon: FolderKanban,
    items: [{ title: 'All Projects', url: '/projects' }],
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings2,
    items: [{ title: 'General', url: '/settings' }],
  },
];

export const authRoutes = ['/login', '/register'] as const;
