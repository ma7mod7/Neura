import {
  Search, Calendar, PlayCircle, Code2, Crown,
  Plus, X, Image as ImageIcon, Youtube, Trash2, ChevronDown
} from 'lucide-react';
import Footer from '../../../shared/components/Footer';
import Course from '../../../assets/course.png';
import AnnouncementCard from '../components/AnnouncementCard';
import NavBar from '../../../shared/components/NavBar';
import { useRef, useState } from 'react';
import { useGetAllPosts, useCreatePost, useEditableCourses, useSections } from "../api";

const AnnouncementsPage = () => {
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [postContent, setPostContent]             = useState("");
  const [postTitle, setPostTitle]                 = useState("");
  const [selectedCourseKeyId, setSelectedCourseKeyId]   = useState("");
  const [selectedCourseNumId, setSelectedCourseNumId]   = useState<number | undefined>(undefined);
  const [selectedSectionId, setSelectedSectionId]       = useState<number | "">("");
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; url: string; type: 'image' | 'video' } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Hooks ──────────────────────────────────────────────────
  const { data: posts = [], isLoading, isError }              = useGetAllPosts();
  const { mutate: createPost, isPending: isCreating }         = useCreatePost();
  const { data: courses = [], isLoading: isLoadingCourses }   = useEditableCourses();
  const { data: sections = [], isLoading: isLoadingSections } = useSections(selectedCourseKeyId);

  // ── Handlers ───────────────────────────────────────────────
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) setSelectedMedia({ file, url: URL.createObjectURL(file), type });
  };

  const clearMedia = () => {
    setSelectedMedia(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const keyId = e.target.value;
    // get the selected course
    const found = courses.find((c) => c.keyId === keyId);
    setSelectedCourseKeyId(keyId);
    setSelectedCourseNumId(found?.id); 
    setSelectedSectionId("");
  };

  const resetModal = () => {
    setPostContent("");
    setPostTitle("");
    setSelectedCourseKeyId("");
    setSelectedCourseNumId(undefined);
    setSelectedSectionId("");
    clearMedia();
    setIsModalOpen(false);
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) return;

    createPost(
      {
        Content:   postContent,
        Title:     postTitle || undefined,
        IsPublic:  true,
        CourseId:  selectedCourseNumId,
        SectionId: selectedSectionId ? Number(selectedSectionId) : undefined,
        Image:     selectedMedia?.type === "image" ? selectedMedia.file : undefined,
      },
      { onSuccess: resetModal }
    );
  };

  const selectClass = "w-full bg-blue-50/50 dark:bg-[#0e0e10] dark:text-white rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:ring-2 ring-blue-500 appearance-none cursor-pointer text-slate-700";

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0e0e10] font-inter relative">
      <NavBar />

      <main className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 lg:p-8">
        {/* --- LEFT SECTION: FEED --- */}
        <div className="lg:col-span-8">
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

          {isLoading && <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>}
          {isError   && <p className="text-red-500 text-sm">Failed to load announcements.</p>}
          {posts.map((post) => (
            <AnnouncementCard key={post.id} post={post} />
          ))}
        </div>

        {/* --- RIGHT SECTION: SIDEBAR --- */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
            <input
              type="text"
              placeholder="Find User"
              className="w-full bg-white dark:bg-[#1c1c1f] dark:text-white dark:placeholder:text-slate-400 rounded-xl py-4 pl-12 pr-4 outline-none shadow-sm focus:ring-2 ring-blue-500 border-transparent border transition-all"
            />
          </div>

          {/* Top Rated Widget */}
          <div className="bg-white dark:bg-[#1c1c1f] rounded-xl p-6 shadow-sm border border-slate-50 dark:border-[#2a2a2e]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Top Rated</h2>
              <Crown className="text-blue-600" size={24} />
            </div>

            <div className="space-y-4">
              {[
                { rank: '#1', name: 'Mahmoud Emad', score: 2500 },
                { rank: '#2', name: 'Mahmoud Emad', score: 2400 },
                { rank: '#3', name: 'Mahmoud Emad', score: 1500 },
                { rank: '#4', name: 'Mahmoud Emad', score: 1200 },
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

          {/* Upcoming Deadlines Widget */}
          <div className="bg-white dark:bg-[#1c1c1f] rounded-xl p-6 shadow-sm border border-slate-50 dark:border-[#2a2a2e]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming Deadlines</h2>
              <Calendar className="text-purple-500" size={24} />
            </div>

            <div className="space-y-4">
              {[
                { title: 'Weekly Contest 420', icon: <Code2 className="text-[#FFB52B]" /> },
                { title: 'Two Pointer Session', icon: <PlayCircle className="text-[#FFB52B]" /> },
                { title: 'Two Pointer Session', icon: <PlayCircle className="text-[#FFB52B]" /> },
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
        </div>
      </main>

      {/* --- FOOTER --- */}
      <Footer />

      {/* --- CREATE POST MODAL --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={resetModal}
        >
          <div
            className="bg-white dark:bg-[#1c1c1f] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-[#AFAFAF] dark:bg-[#2a2a2e] p-3 border-b border-slate-100 dark:border-[#3a3a3e]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Announcement</h2>
              <button onClick={resetModal} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-[#3a3a3e] text-slate-500 dark:text-slate-300 transition-colors bg-[#E4E4E4] dark:bg-[#3a3a3e]">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex flex-col gap-3">
              <input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-blue-50/50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 rounded-xl p-4 text-slate-700 outline-none placeholder:text-slate-500 text-sm border border-transparent focus:ring-2 ring-blue-500"
                placeholder="Title (optional)"
              />

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full h-32 bg-blue-50/50 dark:bg-[#0e0e10] dark:text-white dark:placeholder:text-slate-500 rounded-xl p-4 text-slate-700 outline-none resize-none placeholder:text-slate-500 text-lg"
                placeholder="Write here..."
              />

              {/* Course Dropdown */}
              <div className="relative">
                <select
                  value={selectedCourseKeyId}
                  onChange={handleCourseChange}
                  className={selectClass}
                  disabled={isLoadingCourses}
                >
                  <option value="">
                    {isLoadingCourses ? "Loading courses..." : "Select a course (optional)"}
                  </option>
                  {courses.map((c) => (
                    <option key={c.keyId} value={c.keyId}>{c.title}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Section Dropdown */}
              {selectedCourseKeyId && (
                <div className="relative">
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                    className={selectClass}
                    disabled={isLoadingSections}
                  >
                    <option value="">
                      {isLoadingSections ? "Loading sections..." : "Select a section (optional)"}
                    </option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}

              {/* Media Preview */}
              {selectedMedia && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#3a3a3e] bg-slate-50 dark:bg-[#0e0e10]">
                  <button onClick={clearMedia} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-10 shadow-sm">
                    <Trash2 size={16} />
                  </button>
                  {selectedMedia.type === 'image'
                    ? <img src={selectedMedia.url} alt="Preview" className="w-full h-64 object-contain" />
                    : <video src={selectedMedia.url} controls className="w-full h-64 bg-black" />
                  }
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 pb-4 mt-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" hidden ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} />
                  <button onClick={() => imageInputRef.current?.click()} className="text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2a2e] p-2 rounded-md transition-colors" title="Add Image">
                    <ImageIcon size={22} />
                  </button>
                  <input type="file" accept="video/*" hidden ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} />
                  <button onClick={() => videoInputRef.current?.click()} className="text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2a2e] p-2 rounded-md transition-colors" title="Add Video">
                    <Youtube size={26} />
                  </button>

                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-200">Add to Your Post</span>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={isCreating || !postContent.trim()}
                className="w-full bg-[#0061EF] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50"
              >
                {isCreating ? "Posting..." : "Add Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;