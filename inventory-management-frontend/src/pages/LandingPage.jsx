import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  Bot, 
  CheckCircle2 
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">InventoryPro</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition">Features</a>
              <a href="#roles" className="text-gray-600 hover:text-blue-600 font-medium transition">For Teams</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition">Testimonials</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-semibold px-4 py-2 transition">
                Log In
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-24 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden relative">
        {/* Background blobs for aesthetics */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/30 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-purple-100/30 blur-3xl rounded-full -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border border-blue-100 shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now with AI-Powered Auto Reordering
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Inventory Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Reimagined.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop worrying about stockouts. Automate your supply chain, empower your sales team, and get real-time insights—all in one secure platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Free Trial
            </Link>
            <a 
              href="#demo" 
              className="px-8 py-4 rounded-full text-lg font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-yellow-500" /> Watch Demo
            </a>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">Powerful Features</h2>
            <h3 className="text-4xl font-bold text-gray-900">Everything you need to run your shop</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Bot} 
              color="purple"
              title="Automated Reordering Bot" 
              desc="Never run out of stock. Our intelligent bot monitors levels and places purchase orders automatically when thresholds are breached." 
            />
            <FeatureCard 
              icon={BarChart3} 
              color="blue"
              title="Real-Time Analytics" 
              desc="Gain actionable insights with comprehensive reports on sales, inventory value, and supplier performance." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              color="green"
              title="Role-Based Security" 
              desc="Strict access control ensures Admins, Staff, and Sales Executives only see what they need to see." 
            />
            <FeatureCard 
              icon={Package} 
              color="orange"
              title="Expiry Date Tracking" 
              desc="Prevent losses by tracking batch expiry dates. The system automatically blocks sales of expired items." 
            />
            <FeatureCard 
              icon={Users} 
              color="indigo"
              title="Team Management" 
              desc="Inventory managers can build and manage their own sales teams with custom limits set by admins." 
            />
            <FeatureCard 
              icon={Zap} 
              color="yellow"
              title="Fast POS Operations" 
              desc="Streamlined sales order creation designed for high-speed retail environments." 
            />
          </div>
        </div>
      </section>

      {/* --- ROLES SECTION --- */}
      <section id="roles" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Built for every role in your business</h3>
              <div className="space-y-6">
                <RoleItem title="Admins" desc="Full control over system settings, user management, and high-level reporting." />
                <RoleItem title="Inventory Staff" desc="Manage stock, receive purchase orders, and oversee sales teams." />
                <RoleItem title="Sales Executives" desc="Process customer orders quickly without worrying about backend logistics." />
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
                  <div>
                    <p className="font-bold text-gray-900">System Admin</p>
                    <p className="text-xs text-gray-500">Managing 15 Users</p>
                  </div>
                  <div className="ml-auto text-xs bg-white px-2 py-1 rounded border border-gray-200">Active</div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100 ml-8 opacity-80">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
                  <div>
                    <p className="font-bold text-gray-900">Inventory Manager</p>
                    <p className="text-xs text-gray-500">Managing Sales Team</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100 ml-16 opacity-60">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">SE</div>
                  <div>
                    <p className="font-bold text-gray-900">Sales Executive</p>
                    <p className="text-xs text-gray-500">Processing Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-gray-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to optimize your inventory?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of retailers who trust InventoryPro to manage their stock efficiently.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition shadow-lg hover:shadow-blue-500/50">
              Start Your Free Trial
            </Link>
            <Link to="/login" className="px-10 py-4 rounded-full font-bold text-lg border border-gray-700 hover:bg-gray-800 transition">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">InventoryPro</span>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} InventoryPro Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition">Terms</a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const FeatureCard = ({ icon: Icon, title, desc, color }) => {
  const colors = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="p-8 rounded-2xl border border-gray-100 bg-white hover:shadow-xl transition-shadow duration-300 group">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${colors[color]} group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
};

const RoleItem = ({ title, desc }) => (
  <div className="flex gap-4">
    <div className="mt-1">
      <CheckCircle2 className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <h4 className="text-lg font-bold text-gray-900">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  </div>
);