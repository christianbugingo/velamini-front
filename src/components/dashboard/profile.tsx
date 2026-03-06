"use client";

import Image from "next/image";
import { CheckCircle2, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { Card, CardContent, Avatar, AvatarImage, AvatarFallback, Button, Chip, Link as HeroLink } from "@heroui/react";
import Link from "next/link"; // Keep next/link for internal navigation if needed


interface ProfileViewProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  knowledgeBase?: any;
}


export default function ProfileView({ user, knowledgeBase }: ProfileViewProps) {
  const fullName = knowledgeBase?.fullName || user?.name || "User Name";
  const email = user?.email || "email@example.com";
  const location = knowledgeBase?.currentLocation || "";
  const cover =
    knowledgeBase?.coverImage ||
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2070&auto=format&fit=crop";

  // socials (safe parse)
  const socialLinks = knowledgeBase?.socialLinks
    ? (() => {
      try {
        return JSON.parse(knowledgeBase.socialLinks);
      } catch {
        return {};
      }
    })()
    : {};

  return (
    <div className="w-full text-foreground bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-full p-6 sm:p-8 lg:p-12">
      <div className="mx-auto w-full max-w-6xl space-y-10">

        {/* Profile Card */}
        <Card className="w-full shadow-2xl shadow-slate-200/40 dark:shadow-slate-900/40 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl overflow-hidden">
          <div className="relative h-52 sm:h-72 w-full overflow-hidden">
            <Image
              src={cover}
              alt="Cover"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20" />
          </div>

          <CardContent className="px-8 sm:px-12 pb-10 pt-0 relative overflow-visible">
            <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-16 sm:-mt-20 relative z-10">
              <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-6 border-white dark:border-slate-800 shadow-2xl text-4xl font-bold flex items-center justify-center overflow-hidden rounded-3xl">
                {user?.image ? (
                  <AvatarImage src={user.image} className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(fullName?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">{fullName}</h1>
                    <div className="flex items-center gap-3">
                      <Chip color="accent" variant="primary" size="md" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold">Virtual Self</Chip>
                      <div className="flex items-center gap-2 text-lg text-default-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-medium">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Columns */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Content (Bio/Experience Placeholder) */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 shadow-lg border border-slate-200/60 dark:border-slate-600/40 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">About Me</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                      {knowledgeBase?.bio || "No detailed bio currently available. Complete your training to populate this section."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: Contact & Socials */}
              <div className="space-y-8">
                <Card className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 shadow-xl border border-slate-200/60 dark:border-slate-600/40 backdrop-blur-sm overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/60 dark:border-slate-700/60">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Contact Information
                    </h3>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-700/30 border border-slate-200/40 dark:border-slate-600/30">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">Email</p>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate" title={email}>{email}</p>
                      </div>
                    </div>

                    {location && (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-700/30 border border-slate-200/40 dark:border-slate-600/30">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">Location</p>
                          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{location}</p>
                        </div>
                      </div>
                    )}

                    {socialLinks?.website && (
                      <HeroLink
                        href={socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full no-underline"
                      >
                        <Button
                          variant="secondary"
                          className="w-full flex justify-between items-center p-4 h-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg shadow-violet-200 dark:shadow-violet-900/30 transform transition-all duration-300 hover:scale-[1.02] border-0"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            Website
                          </span>
                          <ArrowUpRight className="w-5 h-5" />
                        </Button>
                      </HeroLink>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
