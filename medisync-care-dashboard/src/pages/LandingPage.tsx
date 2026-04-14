import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Clock, Brain, ArrowRightLeft, ShieldCheck, Heart,
  ChevronRight, Activity, Building2, Store, CheckCircle2
} from "lucide-react";

const features = [
  { icon: Clock, title: "Expiry Tracking System", desc: "Real-time monitoring of medicine shelf life with automated alerts before expiration dates." },
  { icon: Brain, title: "AI Demand Prediction", desc: "Machine learning models forecast demand patterns to optimize stock levels and reduce waste." },
  { icon: ArrowRightLeft, title: "Medicine Redistribution", desc: "Smart matching of near-expiry medicines with hospitals that need them most." },
  { icon: ShieldCheck, title: "Waste Compliance Management", desc: "Automated compliance tracking for pharmaceutical waste disposal regulations." },
  { icon: Heart, title: "Medicine Donation Network", desc: "Connect with NGOs and clinics to donate usable medicines to underserved communities." },
];

const steps = [
  { num: "01", title: "Track Inventory", desc: "Upload your medicine inventory and let MediCycle monitor expiry dates automatically." },
  { num: "02", title: "AI Analysis", desc: "Our AI analyzes demand patterns and identifies redistribution opportunities." },
  { num: "03", title: "Redistribute or Donate", desc: "Matched medicines are sent to hospitals or donated to communities in need." },
  { num: "04", title: "Compliant Disposal", desc: "Remaining waste is disposed through certified biomedical facilities with full tracking." },
];

const stats = [
  { value: "2.4M+", label: "Medicines Saved", icon: Activity },
  { value: "850+", label: "Hospitals Connected", icon: Building2 },
  { value: "3,200+", label: "Retailers Onboarded", icon: Store },
];

const LandingPage = () => (
  <div className="min-h-screen bg-background">
    {/* Nav */}
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">MediCycle</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="gradient-hero py-24 md:py-32">
      <div className="container text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Brain className="h-4 w-4" /> AI-Powered Platform
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
            MediCycle – Medicine Redistribution System
          </h1>
          <p className="mb-8 text-lg text-primary-foreground/70 md:text-xl">
            Reduce pharmaceutical waste by up to 60%. Pharmacies list near-expiry medicines at discounted prices — hospitals, clinics, and NGOs purchase them to save lives and reduce waste.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2 gradient-primary text-primary-foreground border-0 hover:opacity-90">
                Get Started <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Platform Features</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Everything you need to manage medicine lifecycle from procurement to compliant disposal.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <f.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="bg-muted/50 py-20 md:py-28">
      <div className="container">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">A simple four-step workflow to eliminate medicine wastage.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num} className="relative text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-xl font-bold text-primary-foreground">
                {s.num}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Our Impact</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-xl border bg-card p-8 shadow-card">
              <s.icon className="mb-3 h-8 w-8 text-primary" />
              <div className="mb-1 text-4xl font-bold text-gradient-primary">{s.value}</div>
              <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t bg-card py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">MediCycle</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered medicine redistribution platform helping pharmacies reduce waste and connect near-expiry medicines with hospitals, clinics, and NGOs.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
              <li><Link to="/inventory" className="hover:text-primary">Inventory</Link></li>
              <li><Link to="/buyer" className="hover:text-primary">Buy Medicines</Link></li>
              <li><Link to="/orders" className="hover:text-primary">Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@medicycle.io</li>
              <li>+1 (800) 555-MEDI</li>
              <li>123 Health St, MedCity, MC 10001</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © 2026 MediCycle. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;
