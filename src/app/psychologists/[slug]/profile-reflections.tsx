"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Video, X } from "lucide-react";

export interface ReflectionPost {
  id: string;
  type?: string;
  contentType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  title?: string;
  date?: string;
}

interface ProfileReflectionsProps {
  posts: ReflectionPost[];
  psychologistName: string;
}

export function ProfileReflections({ posts, psychologistName }: ProfileReflectionsProps) {
  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    caption?: string;
    title?: string;
  } | null>(null);

  if (!posts || posts.length === 0) {
    return (
      <div className="atmospheric-card p-10 rounded-3xl text-center border border-white/10">
        <p className="text-sm text-[#C9D2BC] font-light">
          No reflections shared yet. Check back soon for thoughts, photos, and video insights.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          const isVideo =
            post.type === "video" ||
            post.contentType === "VIDEO" ||
            (post.mediaUrl && (post.mediaUrl.endsWith(".mp4") || post.mediaUrl.endsWith(".webm") || post.mediaUrl.includes("video")));

          const displayImage = post.thumbnailUrl || (isVideo ? null : post.mediaUrl);

          return (
            <div
              key={post.id}
              className="atmospheric-card rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group hover:border-[#C9D2BC]/40 transition-all duration-300"
            >
              {/* Media container */}
              {isVideo ? (
                <div
                  onClick={() => {
                    if (post.mediaUrl) {
                      setActiveVideo({
                        url: post.mediaUrl,
                        caption: post.caption,
                        title: post.title || `Reflection by ${psychologistName}`,
                      });
                    }
                  }}
                  className="relative aspect-square w-full bg-[#122C25] cursor-pointer group/vid overflow-hidden"
                >
                  {displayImage ? (
                    <Image
                      src={displayImage}
                      alt={post.caption || "Video preview"}
                      fill
                      className="object-cover group-hover/vid:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#173C32] to-[#0E241E] flex items-center justify-center">
                      <Video className="w-12 h-12 text-[#9CAF91]/50" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover/vid:bg-black/25 flex items-center justify-center transition-all">
                    <div className="h-14 w-14 rounded-full bg-[#F1EBDD] text-[#173C32] flex items-center justify-center shadow-xl group-hover/vid:scale-110 transition-transform">
                      <Play className="w-6 h-6 ml-1 fill-current" />
                    </div>
                  </div>

                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold tracking-wider uppercase text-[#F1EBDD] border border-white/10">
                    Video
                  </span>
                </div>
              ) : post.mediaUrl ? (
                <div className="relative aspect-square w-full bg-[#122C25] overflow-hidden">
                  <Image
                    src={post.mediaUrl}
                    alt={post.caption || "Reflection"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="p-8 aspect-square bg-[#244F42]/50 flex items-center justify-center text-center">
                  <p className="font-serif text-lg italic text-[#F1EBDD] leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              )}

              {/* Caption details if image or video */}
              {(post.mediaUrl || isVideo) && post.caption && (
                <div className="p-4 text-xs text-[#C9D2BC] font-light space-y-2">
                  <p className="line-clamp-2 leading-relaxed">{post.caption}</p>
                  {post.date && (
                    <span className="text-[10px] text-[#9CAF91] block">
                      {post.date}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Video Lightbox Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#173C32] rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-[#122C25]/90">
              <div className="pr-4">
                <h3 className="font-serif text-lg text-[#F7F3E9] font-medium line-clamp-1">
                  {activeVideo.title}
                </h3>
                <span className="text-[11px] text-[#9CAF91]">
                  Mind Refill Clinical Reflection
                </span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#C9D2BC] hover:text-white transition-colors"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative bg-black aspect-video flex items-center justify-center">
              <video
                src={activeVideo.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Caption */}
            {activeVideo.caption && (
              <div className="p-4 sm:p-5 bg-[#173C32] text-xs text-[#C9D2BC] font-light border-t border-white/10 max-h-36 overflow-y-auto">
                <p className="leading-relaxed whitespace-pre-wrap">{activeVideo.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
