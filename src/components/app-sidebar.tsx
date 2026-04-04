"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  TerminalSquareIcon,
  StarIcon,
  MessageSquareIcon,
} from "lucide-react";

// This is sample data.
const data = {
  teams: [
    {
      name: "Project Portfolio",
      logo: <GalleryVerticalEndIcon />,
      // plan: "Enterprise",
    },
    // {
    //   name: "Acme Corp.",
    //   logo: (
    //     <AudioLinesIcon
    //     />
    //   ),
    //   plan: "Startup",
    // },
    // {
    //   name: "Evil Corp.",
    //   logo: (
    //     <TerminalIcon
    //     />
    //   ),
    //   plan: "Free",
    // },
  ],
  navMain: [
    {
      title: "Youtube",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Videos",
          url: "#videos-section",
        },
      ],
    },
    {
      title: "Testimonials",
      url: "#",
      icon: <StarIcon />,
      isActive: false,
      items: [
        {
          title: "Manage",
          url: "#testimonials-section",
        },
      ],
    },
    {
      title: "Contact Messages",
      url: "#",
      icon: <MessageSquareIcon />,
      isActive: false,
      items: [
        {
          title: "View",
          url: "#contact-section",
        },
      ],
    },
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: <BotIcon />,
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: <BookOpenIcon />,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: <Settings2Icon />,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: (
  //       <FrameIcon
  //       />
  //     ),
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: (
  //       <PieChartIcon
  //       />
  //     ),
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: (
  //       <MapIcon
  //       />
  //     ),
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName ?? firebaseUser.email ?? "Admin",
          email: firebaseUser.email ?? "",
          avatar: firebaseUser.photoURL ?? "",
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
