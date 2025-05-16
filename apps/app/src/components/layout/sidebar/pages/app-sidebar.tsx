'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Activity,
  Blocks,
  BookOpen,
  Code,
  Database,
  GitBranch,
  Settings2,
  Shield,
  Wallet,
} from 'lucide-react';
import type * as React from 'react';

import { NavMain } from './nav-main';
import { NavProjects } from './nav-project';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

const networkId = '1';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: Activity,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/',
          disabled: false,
        },
        {
          title: 'Analytics',
          url: '#',
          disabled: true, // Future feature
        },
      ],
    },
    {
      title: 'Networks',
      url: '#',
      icon: Database,
      isActive: true,
      items: [
        {
          title: 'Manage Networks',
          url: `/network`,
          disabled: false,
        },
        {
          title: 'Network Health',
          url: '#',
          disabled: true, // Future feature
        },
      ],
    },
    {
      title: 'Smart Contracts',
      url: '#',
      icon: Code,
      items: [
        {
          title: 'Deployed Contracts',
          url: '#',
          disabled: true, // Future feature
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General Settings',
          url: '#',
          disabled: true, // Future feature
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Demo Project',
      url: '#',
      icon: Wallet,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
