import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PORTAL_URLS, API_V1 } from "@itp/utils";
import type { Track } from "@itp/types";
import { Skeleton } from "@itp/ui";

const features = [
  { icon: "fa-code", title: "Hands-on Projects", desc: "Build real-world applications with guided mentorship." },
  { icon: "fa-users", title: "Expert Mentors", desc: "Learn from industry professionals with years of experience." },
  { icon: "fa-book-open", title: "Structured Curriculum", desc: "Progressive modules with quizzes and evaluations." },
  { icon: "fa-award", title: "Certificate", desc: "Earn a recognized certificate upon successful completion." },
];

const steps = [
  { num: 1, title: "Apply Online", desc: "Submit your application with academic details." },
  { num: 2, title: "Get Selected", desc: "Our team reviews and selects qualified candidates." },
  { num: 3, title: "Start Learning", desc: "Begin your structured training journey with mentors." },
  { num: 4, title: "Get Certified", desc: "Complete the program and earn your certificate." },
];

const TRACK_VISUALS: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  FS: { icon: "fa-laptop-code", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  DS: { icon: "fa-brain", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  FL: { icon: "fa-mobile-screen", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  CD: { icon: "fa-cloud", iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  UX: { icon: "fa-paintbrush", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  PB: { icon: "fa-chart-bar", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  CY: { icon: "fa-shield-halved", iconBg: "bg-red-100", iconColor: "text-red-600" },
};

const FALLBACK_TRACKS: Track[] = [
  {
    id: "fs",
    name: "Full Stack Web Development",
    code: "FS",
    slug: "full-stack",
    description: "Build production-ready web apps with React, Node.js, and databases.",
    fee_inr: 4999,
    duration: "16 weeks",
  },
  {
    id: "ds",
    name: "Python & AI / Machine Learning",
    code: "DS",
    slug: "ai-ml",
    description: "Python, data science, ML models, and AI application development.",
    fee_inr: 5999,
    duration: "16 weeks",
  },
  {
    id: "fl",
    name: "Flutter Mobile Development",
    code: "FL",
    slug: "flutter",
    description: "Cross-platform mobile apps with Flutter, Dart, and Firebase.",
    fee_inr: 5499,
    duration: "14 weeks",
  },
  {
    id: "cd",
    name: "Cloud & DevOps Engineering",
    code: "CD",
    slug: "devops",
    description: "AWS, Docker, CI/CD pipelines, and infrastructure automation.",
    fee_inr: 6499,
    duration: "14 weeks",
  },
  {
    id: "ux",
    name: "UI/UX Design",
    code: "UX",
    slug: "ui-ux",
    description: "User research, wireframing, prototyping, and design systems.",
    fee_inr: 4499,
    duration: "12 weeks",
  },
  {
    id: "pb",
    name: "Power BI & Data Analytics",
    code: "PB",
    slug: "power-bi",
    description: "Power BI dashboards, SQL, and business intelligence reporting.",
    fee_inr: 3999,
    duration: "10 weeks",
  },
];

function TrackCard({ track }: { track: Track }) {
  const visual = TRACK_VISUALS[track.code] ?? {
    icon: "fa-graduation-cap",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  };
  const slug = track.slug ?? track.code.toLowerCase();
  const fee = track.fee_inr ? `₹${track.fee_inr.toLocaleString("en-IN")}` : "Contact us";

  return (
    <Link
      to={`/track/${slug}`}
      className="track-card card-hover block rounded-2xl p-8 text-left no-underline"
    >
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl ${visual.iconBg} ${visual.iconColor}`}
      >
        <i className={`fas ${visual.icon} text-2xl`} />
      </div>
      <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
        {track.code}
      </span>
      <h3 className="mt-2 text-xl font-bold text-gray-900">{track.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{track.description}</p>
      {track.duration && (
        <p className="mt-3 text-xs text-gray-500">
          <i className="fas fa-clock mr-1.5 text-blue-500" />
          {track.duration}
        </p>
      )}
      <p className="mt-4 text-2xl font-bold text-blue-600">{fee}</p>
      <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700">
        View details <i className="fas fa-arrow-right ml-2 text-xs" />
      </span>
    </Link>
  );
}

export default function HomePage() {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["landing-tracks"],
    queryFn: async () => {
      const { data } = await axios.get<Track[]>(`${API_V1}/public/tracks`);
      return data;
    },
    retry: 1,
  });

  const displayTracks = tracks?.length ? tracks : FALLBACK_TRACKS;

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src="https://lh3.googleusercontent.com/aida/ADBb0uiOtVs5OOkDusuvshDBQS55FnGAI1srgc0t6QzpZG61a94ZqIilXJ1H4tiTMhrwhu5CzmM91jDuGfhsQukyPE5A1TSFRVvke8F5n9_vahsi2FLQVd1WcTGXKRuly-znO3y2uL9kqKeLJYTJBmxY5pYTIqKLtN3vM_cBNmdYaBu-HMZwSR-UfuTodoQ6IqSvapNKdTpK49WAeLTwOtJL6PcUROfOUPx8rTbBybrzu2mZkGd6QESo-ctdMm5IGTQmMEOO8dedd7yj"
              alt="AltisOne"
              className="h-16 object-contain sm:h-24"
            />
          </div>
          <div className="flex items-center gap-4">
            <a href="#tracks" className="hidden text-gray-700 hover:text-blue-600 sm:block">
              Tracks
            </a>
            <a href="#how-it-works" className="hidden text-gray-700 hover:text-blue-600 sm:block">
              How It Works
            </a>
            <a href={PORTAL_URLS.lms} className="hidden text-gray-700 hover:text-blue-600 sm:block">
              Trainee Portal
            </a>
            <Link to="/apply">
              <button type="button" className="btn-landing-primary rounded-btn px-6 py-3 font-semibold text-white">
                Apply Now
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="gradient-bg px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Launch Your Tech Career with{" "}
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              AltisOneLabz
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 md:text-xl">
            A comprehensive internship training program designed to transform students into
            industry-ready developers through structured learning, mentorship, and real projects.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/apply">
              <button type="button" className="rounded-btn bg-white px-8 py-4 font-bold text-blue-700 shadow-lg transition hover:scale-105">
                Start Your Application <i className="fas fa-arrow-right ml-2" />
              </button>
            </Link>
            <button
              type="button"
              className="rounded-btn border-2 border-white/50 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              onClick={() => document.getElementById("tracks")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Tracks
            </button>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title text-center text-3xl font-bold text-gray-900">Program Overview</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Everything you need to go from beginner to job-ready developer.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-md">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <i className={`fas ${f.icon} text-xl`} />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tracks" className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="section-title text-3xl font-bold text-gray-900">Training Tracks</h2>
          <p className="mt-4 text-gray-600">
            Industry-aligned programs in software, data, cloud, design, and security.
          </p>

          {isLoading ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayTracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          )}

          <Link to="/apply" className="mt-10 inline-block">
            <button type="button" className="btn-landing-primary rounded-btn px-8 py-3 font-semibold text-white">
              Apply to a Track <i className="fas fa-arrow-right ml-2" />
            </button>
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="bg-gray-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title text-center text-3xl font-bold text-gray-900">How It Works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                  {s.num}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="gradient-bg px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-blue-100">Applications are open. Submit yours today.</p>
          <Link to="/apply" className="mt-8 inline-block">
            <button type="button" className="rounded-btn bg-white px-8 py-4 font-bold text-blue-700 shadow-lg transition hover:scale-105">
              Apply Now <i className="fas fa-arrow-right ml-2" />
            </button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AltisOne Labz. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
