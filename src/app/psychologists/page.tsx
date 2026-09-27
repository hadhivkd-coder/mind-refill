import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { TaxonomyService } from "@/modules/profiles/services/taxonomy.service";
import {
  Search,
  ArrowRight,
  CheckCircle2,
  Users,
  ChevronDown,
  LayoutGrid,
  List,
  Globe,
  Calendar,
  Star
} from "lucide-react";

export const metadata = {
  title: "Find a Verified Psychologist | Mind Refill",
  description: "Discover licensed and rigorously verified psychologists on Mind Refill.",
};

export const dynamic = "force-dynamic";

interface DirectoryPageProps {
  searchParams: {
    q?: string;
    specialization?: string;
    language?: string;
  };
}

export default async function PsychologistsDirectoryPage({ searchParams }: DirectoryPageProps) {
  const query = searchParams.q || "";
  const specializationSlug = searchParams.specialization || "";

  // We are using mock data that precisely matches the provided design in order to enforce the exact layout requested.
  // In a real production deployment, this would be swapped out with the DirectoryService payload.
  
  const mockPsychologists = [
    { slug: "dr-anjali-menon", name: "Dr. Anjali Menon", title: "Clinical Psychologist", rating: "4.9", sessions: "120+", tags: ["Anxiety", "Relationships", "Self-esteem"], lang: "English, Malayalam", avail: "Available this week", bio: "I help individuals navigate anxiety, relationship challenges and life transitions with a warm...", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" },
    { slug: "dr-nikhil-das", name: "Dr. Nikhil Das", title: "Clinical Psychologist", rating: "4.8", sessions: "95+", tags: ["Depression", "Stress", "Life Transitions"], lang: "English, Hindi", avail: "Available today", bio: "I work with individuals facing stress, low mood and major life changes, using evidence-based...", image: "https://images.unsplash.com/photo-1600804889194-e6fbf08ddb39?auto=format&fit=crop&q=80&w=600" },
    { slug: "dr-reshma-k", name: "Dr. Reshma K", title: "Counselling Psychologist", rating: "4.9", sessions: "110+", tags: ["Trauma", "Anxiety", "Personal Growth"], lang: "English, Malayalam", avail: "Available this week", bio: "I provide a safe and supportive space to explore your experiences, heal from past...", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600" },
    { slug: "ms-fathima-r", name: "Ms. Fathima R", title: "Counselling Psychologist", rating: "4.7", sessions: "80+", tags: ["Relationships", "Self-growth", "Young Adults"], lang: "English, Malayalam", avail: "Available today", bio: "I support individuals and couples in building healthier relationships and a stronger sense...", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBFA] text-[#1A1A1A] font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-24">
        {/* ========================================================================= */}
        {/* 1. DIRECTORY HERO */}
        {/* ========================================================================= */}
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#FCFBFA] via-[#F4EFF9] to-[#EAE6F0] pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#F0EBF7]">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
             <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#FCFBFA] rounded-full blur-[100px] opacity-80" />
             <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#F4EFF9] rounded-full blur-[120px] opacity-70" />
             {/* Floral/Leaf vector graphics on the center-right */}
             <div className="absolute top-[20%] right-[40%] text-[#AFA1CE] opacity-40 transform scale-150">
               <svg width="80" height="120" viewBox="0 0 80 120" fill="none"><path d="M40 120 C 40 80, 20 60, 0 40 C 20 50, 40 70, 40 120 M40 100 C 60 80, 80 60, 80 40 C 60 50, 40 70, 40 100" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
             </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            
            {/* Left Content */}
            <div className="w-full lg:w-[55%] space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#AFA1CE] uppercase">Verified • Compassionate • Professional</span>
                </div>
                <h1 className="text-[3rem] lg:text-[4.25rem] font-bold text-[#1A1A1A] tracking-tight leading-[1.1]">
                  Meet people who <span className="text-[#7856A4]">understand.</span>
                </h1>
                <p className="text-[18px] lg:text-[20px] text-[#666666] font-normal leading-relaxed max-w-xl">
                  Connect with qualified, compassionate psychologists who specialize in exactly what you&apos;re going through.
                </p>
              </div>

              {/* Search Bar Container */}
              <div className="w-full max-w-2xl space-y-4">
                <div className="w-full bg-white rounded-full p-2.5 flex items-center shadow-[0_8px_30px_rgb(120,86,164,0.06)] border border-[#EEEAF5]">
                  <Search className="w-5 h-5 text-[#AFA1CE] ml-3 mr-3 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search by name, specialization, or language..." 
                    className="flex-1 bg-transparent border-none outline-none text-[#1A1A1A] placeholder-[#AFA1CE] text-[15px]"
                  />
                  <button className="bg-[#7856A4] hover:bg-[#63458A] text-white px-8 py-3 rounded-full font-bold text-[14px] transition-colors shadow-sm shrink-0">
                    Search
                  </button>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button className="bg-[#7856A4] text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition-colors">
                    All Specializations
                  </button>
                  {["Anxiety", "Depression", "Trauma & PTSD", "Relationships", "Life Transitions"].map(tag => (
                    <button key={tag} className="bg-white border border-[#EEEAF5] hover:border-[#AFA1CE] text-[#666666] hover:text-[#7856A4] px-4 py-2 rounded-full text-[13px] font-medium transition-colors">
                      {tag}
                    </button>
                  ))}
                  <button className="bg-white border border-[#EEEAF5] hover:border-[#AFA1CE] text-[#666666] hover:text-[#7856A4] px-4 py-2 rounded-full text-[13px] font-medium flex items-center gap-1 transition-colors">
                    More <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full lg:w-[45%] relative flex justify-center lg:justify-end">
              <div 
                className="relative w-full max-w-[560px] aspect-[4/3] overflow-hidden" 
                style={{ borderRadius: "20px 20px 40% 60% / 20px 20px 20% 30%" }}
              >
                <Image src="https://images.unsplash.com/photo-1573497019230-192664b58e72?auto=format&fit=crop&q=80&w=1200" alt="Therapy Session" fill className="object-cover" />
              </div>
              
              {/* Floating Glass Card */}
              <div className="absolute bottom-10 -left-6 sm:left-4 lg:-left-12 bg-white/95 backdrop-blur-md rounded-[20px] p-5 flex items-center gap-4 shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-[#F4EFF9] w-[280px]">
                <div className="w-14 h-14 rounded-full bg-[#F4EFF9] flex items-center justify-center flex-shrink-0 text-[#7856A4]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-[18px]">100+</h4>
                  <p className="text-[12px] text-[#666666] leading-snug mt-0.5">Verified psychologists ready to support you</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. LISTING CONTROLS */}
        {/* ========================================================================= */}
        <section className="w-full bg-[#FCFBFA] pt-16 pb-6">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-[1.75rem] font-bold text-[#1A1A1A] tracking-tight">Available Psychologists</h2>
              <p className="text-[14px] text-[#666666] mt-1">Showing 12 psychologists</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[13px] text-[#666666]">
                <span>Sort by</span>
                <button className="flex items-center justify-between gap-2 bg-white border border-[#EEEAF5] px-4 py-2 rounded-full font-medium hover:border-[#AFA1CE] transition-colors min-w-[120px]">
                  Relevance <ChevronDown className="w-4 h-4 text-[#AFA1CE]" />
                </button>
              </div>

              <div className="flex items-center bg-white border border-[#EEEAF5] rounded-full p-1 shadow-sm">
                <button className="w-8 h-8 rounded-full bg-[#F4EFF9] text-[#7856A4] flex items-center justify-center transition-colors">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full text-[#AFA1CE] hover:text-[#7856A4] flex items-center justify-center transition-colors">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. LISTING GRID */}
        {/* ========================================================================= */}
        <section className="w-full bg-[#FCFBFA] pb-24">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {mockPsychologists.map((psych, i) => (
                <div key={i} className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-transparent hover:border-[#F4EFF9] transition-all flex flex-col group overflow-hidden">
                  
                  {/* Image */}
                  <div className="relative w-full h-48 bg-[#F8F6FC]">
                    <Image src={psych.image} alt={psych.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7856A4]" />
                      <span className="text-[11px] font-bold text-[#7856A4]">Verified</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-[17px] font-bold text-[#1A1A1A] leading-tight">{psych.name}</h3>
                    <p className="text-[13px] text-[#666666] mt-0.5">{psych.title}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {psych.tags.map(tag => (
                        <span key={tag} className="bg-[#F8F6FC] text-[#7856A4] text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20M2 12h20" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#666666] mt-5">
                      <div className="flex items-center gap-1.5 truncate">
                        <Globe className="w-3.5 h-3.5 text-[#AFA1CE] shrink-0" />
                        <span className="truncate">{psych.lang}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span className="text-[#10B981]">{psych.avail}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-3">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-[13px] font-bold text-[#1A1A1A]">{psych.rating}</span>
                      <span className="text-[12px] text-[#AFA1CE]">({psych.sessions})</span>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-[12.5px] text-[#666666] mt-4 leading-relaxed line-clamp-2">
                      {psych.bio}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-6 pt-5 border-t border-[#F0EBF7] pb-1">
                      <Link href={`/psychologists/${psych.slug}`} className="flex-1 bg-white border border-[#D1C4E9] hover:border-[#7856A4] text-[#7856A4] text-[12.5px] font-bold py-2.5 rounded-full text-center transition-colors">
                        View Profile
                      </Link>
                      <Link href={`/psychologists/${psych.slug}/book`} className="flex-1 bg-[#7856A4] hover:bg-[#63458A] text-white text-[12.5px] font-bold py-2.5 rounded-full text-center transition-colors shadow-sm flex items-center justify-center gap-1.5">
                        Book Session <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Pagination */}
            <div className="mt-16 flex justify-center">
              <button className="bg-white border border-[#EEEAF5] hover:border-[#AFA1CE] hover:text-[#7856A4] text-[#666666] font-bold text-[14px] px-8 py-3 rounded-full transition-colors shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                Load More Psychologists
              </button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
