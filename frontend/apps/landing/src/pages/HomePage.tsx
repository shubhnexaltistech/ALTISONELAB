import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Award, Code2 } from "lucide-react";
import { Button } from "@itp/ui";
import { PORTAL_URLS } from "@itp/utils";

const features = [
  { icon: Code2, title: "Hands-on Projects", desc: "Build real-world applications with guided mentorship." },
  { icon: Users, title: "Expert Mentors", desc: "Learn from industry professionals with years of experience." },
  { icon: BookOpen, title: "Structured Curriculum", desc: "Progressive modules with quizzes and evaluations." },
  { icon: Award, title: "Certificate", desc: "Earn a recognized certificate upon successful completion." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              A1
            </div>
            <span className="text-lg font-bold text-slate-900">AltisOne ITP</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={PORTAL_URLS.lms} className="hidden text-sm text-slate-600 hover:text-brand-600 sm:block">
              Trainee Portal
            </a>
            <Link to="/apply">
              <Button>Apply Now</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-brand-50 to-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Launch Your Tech Career with{" "}
            <span className="text-brand-600">AltisOne ITP</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            A comprehensive internship training program designed to transform students into
            industry-ready developers through structured learning, mentorship, and real projects.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/apply">
              <Button size="lg">
                Start Your Application
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">Why AltisOne ITP?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Everything you need to go from beginner to job-ready developer.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="mb-4 inline-flex rounded-lg bg-brand-50 p-3 text-brand-600">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-600 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-brand-100">Applications are open. Submit yours today.</p>
          <Link to="/apply" className="mt-8 inline-block">
            <Button variant="secondary" size="lg">Apply Now</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} AltisOne Labz. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
