import {
   Plus, X, Image as ImageIcon, Trash2, Loader2
} from 'lucide-react';
import Footer from '../../../shared/components/Footer';
import AnnouncementCard from '../components/AnnouncementCard';
import NavBar from '../../../shared/components/NavBar';
import { useRef, useState } from 'react';
// ⭐ استيراد مكتبة التمرير اللانهائي
import InfiniteScroll from 'react-infinite-scroll-component';
import { useGetAllPosts, useCreatePost } from "../api";
import type { AnnouncementPost } from "../api/types";

const AnnouncementsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle]     = useState("");
  
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; url: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Hooks ──────────────────────────────────────────────────
  // ⭐ استخدام الـ Infinite Query الجديد
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage 
  } = useGetAllPosts();
  
  const { mutate: createPost, isPending: isCreating } = useCreatePost();

  // ⭐ استخراج وتسطيح (Flattening) كل البوستات من جميع الصفحات
  const allPosts: AnnouncementPost[] = data?.pages.flatMap((page: any) => {
    if (Array.isArray(page)) return page;
    if (Array.isArray(page?.items)) return page.items;
    if (Array.isArray(page?.data)) return page.data;
    return [];
  }) || [];

  // ── Handlers ───────────────────────────────────────────────
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setSelectedMedia({ file, url: URL.createObjectURL(file) });
    }
  };

  const clearMedia = () => {
    setSelectedMedia(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const resetModal = () => {
    setPostContent("");
    setPostTitle("");
    clearMedia();
    setIsModalOpen(false);
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) return;

    createPost(
      {
        Content: postContent,
        Title: postTitle || undefined,
        Image: selectedMedia?.file, 
      },
      { onSuccess: resetModal }
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0e0e10] font-inter relative">
      <NavBar />

      <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 lg:p-8">
        {/* --- LEFT SECTION: FEED --- */}
        <div className="lg:col-span-12">
          <div className='flex justify-between items-center'>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Announcements</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className='bg-blue-600 text-white flex gap-3 p-2 rounded-xl hover:bg-blue-500 cursor-pointer transition-colors'
            >
              <p className='font-semibold'>Add Post</p>
              <span><Plus className='text-white' /></span>
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          )}
          
          {isError && (
            <p className="text-red-500 text-sm text-center py-10">Failed to load announcements.</p>
          )}
          
          {/* ⭐ استخدام InfiniteScroll לעرض البوستات */}
          {!isLoading && !isError && (
            <InfiniteScroll
              dataLength={allPosts.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={
                <div className="flex justify-center py-6 overflow-hidden">
                  <Loader2 className="animate-spin text-blue-600" size={30} />
                </div>
              }
              endMessage={
                <p className="text-center py-6 text-slate-500 dark:text-slate-400 font-medium">
                  <b>You are all caught up! 🎉</b>
                </p>
              }
              className="space-y-6"
            >
              {allPosts.map((post) => (
                <AnnouncementCard key={post.id} post={post}  />
              ))}
            </InfiniteScroll>
          )}
        </div>

        {/* --- RIGHT SECTION: SIDEBAR --- */}
        {/* <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
            <input
              type="text"
              placeholder="Find User"
              className="w-full bg-white dark:bg-[#1c1c1f] dark:text-white dark:placeholder:text-slate-400 rounded-xl py-4 pl-12 pr-4 outline-none shadow-sm focus:ring-2 ring-blue-500 border-transparent border transition-all"
            />
          </div>

          <div className="bg-white dark:bg-[#1c1c1f] rounded-xl p-6 shadow-sm border border-slate-50 dark:border-[#2a2a2e]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Top Rated</h2>
              <Crown className="text-blue-600" size={24} />
            </div>

            <div className="space-y-4">
              {[
                { rank: '#1', name: 'Mahmoud Emad', score: 2500 },
                { rank: '#2', name: 'Ahmed Ali', score: 2400 },
                { rank: '#3', name: 'Sara', score: 1500 },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-blue-300/50 dark:bg-[#2a2a2e] rounded-2xl border border-blue-100/50 dark:border-[#3a3a3e]">
                  <div className="flex items-center gap-3">
                    <span className="text-[#FFB52B] font-bold text-xs">{user.rank}</span>
                    <img src={Course} className="w-10 h-10 rounded-full" alt="user" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{user.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">Level 1</p>
                    </div>
                  </div>
                  <div className="bg-[#FFB52B] text-white px-4 py-1.5 rounded-full text-xs font-bold">{user.score}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1c1f] rounded-xl p-6 shadow-sm border border-slate-50 dark:border-[#2a2a2e]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming Deadlines</h2>
              <Calendar className="text-purple-500" size={24} />
            </div>

            <div className="space-y-4">
              {[
                { title: 'Weekly Contest 420', icon: <Code2 className="text-[#FFB52B]" /> },
                { title: 'Two Pointer Session', icon: <PlayCircle className="text-[#FFB52B]" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-blue-300/50 dark:bg-[#2a2a2e] rounded-2xl">
                  <div className="bg-white dark:bg-[#1c1c1f] p-2 rounded-xl shadow-sm">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">11/3/2025 at 10:30 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </main>

      <Footer />

      {/* --- CREATE POST MODAL --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={resetModal}
        >
          <div
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-[#2a2a2e]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Announcement</h2>
              <button onClick={resetModal} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#2a2a2e] text-slate-500 dark:text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Post Title</label>
                <input
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0e0e10] dark:text-white rounded-xl p-4 text-sm border border-slate-200 dark:border-[#2a2a2e] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Enter title (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Post Content <span className="text-red-500">*</span></label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full h-32 bg-slate-50 dark:bg-[#0e0e10] dark:text-white rounded-xl p-4 text-sm border border-slate-200 dark:border-[#2a2a2e] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all"
                  placeholder="What's on your mind?"
                />
              </div>

              {selectedMedia && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#3a3a3e] bg-slate-50 dark:bg-[#0e0e10] mt-2">
                  <button onClick={clearMedia} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-10 shadow-sm">
                    <Trash2 size={16} />
                  </button>
                  <img src={selectedMedia.url} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-[#2a2a2e] bg-slate-50/50 dark:bg-[#1c1c1f]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" hidden ref={imageInputRef} onChange={handleFileChange} />
                  <button onClick={() => imageInputRef.current?.click()} className="text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#3a3a3e] p-2 rounded-md transition-colors" title="Add Image">
                    <ImageIcon size={22} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={isCreating || !postContent.trim()}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Posting..." : "Publish Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;