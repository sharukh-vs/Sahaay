import React, { useState } from 'react';
import { 
  Search, MapPin, Star, Linkedin, Twitter, Facebook, Youtube, 
  ChevronRight, ChevronLeft, Mail, Menu, X, Globe, ChevronDown,
  ShieldCheck, Percent, ShoppingCart, Lightbulb, Fan, ToggleRight,
  Zap, Wrench, Droplets, CheckCircle2, ArrowLeft
} from 'lucide-react';

// --- MOCK DATA ---
const platformData = {
  categories: {
    Electrical: {
      name: 'Electrical',
      searchPlaceholder: 'Search in Electrician',
      subcategories: [
        { id: 'light', title: 'Light', icon: Lightbulb },
        { id: 'fan', title: 'Fan', icon: Fan },
        { id: 'switch', title: 'Switch & socket', icon: ToggleRight },
        { id: 'mcb', title: 'MCB & fuse', icon: Zap },
        { id: 'inverter', title: 'Inverter', icon: Wrench },
      ],
      services: {
        light: [
          {
            id: 'l1',
            title: 'Light installation',
            rating: '4.85',
            reviews: '24K reviews',
            price: 99,
            image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5e89?auto=format&fit=crop&q=80&w=200',
            options: 3,
            description: 'Installation of bulb, tubelight, or basic decorative lights.'
          },
          {
            id: 'l2',
            title: 'Tubelight repair',
            rating: '4.78',
            reviews: '12K reviews',
            price: 79,
            image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=200',
            options: 2,
            description: 'Fixing flickering, wiring issues, or choke replacement.'
          },
          {
            id: 'l3',
            title: 'Chandelier installation',
            rating: '4.91',
            reviews: '3K reviews',
            price: 499,
            image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=200',
            options: 0,
            description: 'Professional assembly and installation of heavy chandeliers.'
          }
        ],
        fan: [
          {
            id: 'f1',
            title: 'Ceiling fan installation',
            rating: '4.82',
            reviews: '30K reviews',
            price: 149,
            image: 'https://images.unsplash.com/photo-1616616421064-07204ee133bd?auto=format&fit=crop&q=80&w=200',
            options: 2,
            description: 'Includes assembly, installation and basic wiring.'
          }
        ],
        switch: [
          {
            id: 's1',
            title: 'Switchboard repair',
            rating: '4.75',
            reviews: '18K reviews',
            price: 89,
            image: 'https://images.unsplash.com/photo-1558210834-473f430c09ac?auto=format&fit=crop&q=80&w=200',
            options: 4,
            description: 'Replacement of burnt switches, sockets or complete boards.'
          }
        ]
      }
    },
    Plumbing: {
      name: 'Plumbing',
      searchPlaceholder: 'Search in Plumber',
      subcategories: [
        { id: 'tap', title: 'Tap & mixer', icon: Droplets },
        { id: 'basin', title: 'Basin & sink', icon: Wrench },
      ],
      services: {
        tap: [
          {
            id: 't1',
            title: 'Tap repair',
            rating: '4.80',
            reviews: '131K reviews',
            price: 99,
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200',
            options: 4,
            description: 'Fixing leaking taps or complete replacement.'
          }
        ]
      }
    }
  }
};

// --- REUSABLE COMPONENTS ---

const TopUtilityBar = ({ categoryData }) => (
  <div className="bg-white border-b border-slate-200 sticky top-20 z-40 hidden md:block">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-6 items-center">
      {/* Location Selector */}
      <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2.5 bg-white min-w-[300px] cursor-pointer hover:border-indigo-500 transition-colors">
        <MapPin className="w-5 h-5 text-indigo-600" />
        <span className="text-slate-700 font-medium truncate flex-1 text-sm">1201, Cliff Ave- Hiranandani ...</span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </div>

      {/* Search Bar */}
      <div className="flex-1 flex items-center gap-3 border border-slate-300 rounded-lg px-4 py-2.5 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-sm">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder={categoryData?.searchPlaceholder || "Search for services"}
          className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium text-sm outline-none"
        />
      </div>
    </div>
  </div>
);

const SubcategoryGrid = ({ subcategories, activeId, onSelect }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <h3 className="text-slate-500 font-semibold mb-6 text-sm uppercase tracking-wider">Select a service</h3>
    <div className="grid grid-cols-3 gap-y-8 gap-x-4">
      {subcategories.map((sub) => {
        const Icon = sub.icon;
        const isActive = activeId === sub.id;
        return (
          <div 
            key={sub.id} 
            onClick={() => onSelect(sub.id)}
            className="flex flex-col items-center gap-3 cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-indigo-50 border-2 border-indigo-600 shadow-sm' 
                : 'bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-300'
            }`}>
              <Icon className={`w-7 h-7 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
            </div>
            <span className={`text-xs text-center font-medium ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
              {sub.title}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const ServiceListItem = ({ service }) => (
  <div className="py-8 border-b border-slate-100 flex gap-6 last:border-0">
    <div className="flex-1">
      <h4 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h4>
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 fill-indigo-600 text-indigo-600" />
        <span className="font-bold text-slate-800 text-sm">{service.rating}</span>
        <span className="text-slate-500 text-sm">({service.reviews})</span>
      </div>
      <div className="font-bold text-slate-900 mb-4">
        Starts at ₹{service.price}
      </div>
      <button className="text-indigo-600 font-semibold text-sm hover:text-indigo-700">
        View details
      </button>
    </div>
    
    <div className="w-32 flex flex-col items-center shrink-0">
      <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100 mb-[-16px] relative z-0">
        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
      </div>
      <button className="relative z-10 w-24 bg-white border border-slate-200 text-indigo-600 font-bold py-2 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors uppercase text-sm">
        Add
      </button>
      {service.options > 0 && (
        <span className="text-xs text-slate-500 mt-2 font-medium">{service.options} options</span>
      )}
    </div>
  </div>
);

const CartSidebar = () => (
  <div className="space-y-6">
    {/* Cart Empty State */}
    <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <ShoppingCart className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-500 font-medium">No items in your cart</p>
    </div>

    {/* Offers */}
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex gap-4 items-start mb-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <Percent className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h5 className="font-bold text-slate-900">Get visitation fee off</h5>
          <p className="text-slate-500 text-sm">On orders above ₹499</p>
        </div>
      </div>
      <button className="text-indigo-600 font-semibold text-sm flex items-center gap-1">
        View More Offers <ChevronDown className="w-4 h-4" />
      </button>
    </div>

    {/* Promises */}
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
      <h5 className="font-bold text-slate-900 text-lg mb-4">Sahaay Promise</h5>
      <ul className="space-y-3">
        {['Verified Professionals', 'Hassle Free Booking', 'Transparent Pricing'].map((promise, i) => (
          <li key={i} className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-slate-700" />
            <span className="text-slate-700 font-medium">{promise}</span>
          </li>
        ))}
      </ul>
      <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-50 opacity-50" />
      <div className="absolute top-6 right-6 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
         <ShieldCheck className="w-6 h-6 text-indigo-600" />
      </div>
    </div>
  </div>
);

// --- MAIN PAGES ---

const CategoryDetailsPage = ({ categoryName, onBack }) => {
  const data = platformData.categories[categoryName] || platformData.categories.Electrical;
  const [activeSubcategory, setActiveSubcategory] = useState(data.subcategories[0].id);
  
  const currentServices = data.services[activeSubcategory] || [];
  const currentSubcategoryData = data.subcategories.find(s => s.id === activeSubcategory);

  return (
    <div className="min-h-screen bg-[#f5f6f8] pt-20">
      <TopUtilityBar categoryData={data} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Back Button */}
        <button onClick={onBack} className="md:hidden flex items-center gap-2 text-slate-600 mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8 hidden md:block">{data.name} Services</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar - Subcategories */}
          <div className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-48">
             <SubcategoryGrid 
               subcategories={data.subcategories} 
               activeId={activeSubcategory} 
               onSelect={setActiveSubcategory} 
             />
          </div>

          {/* Middle Pane - Services List */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 w-full">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{currentSubcategoryData?.title}</h2>
            <div className="mt-6">
              {currentServices.length > 0 ? (
                currentServices.map(service => (
                  <ServiceListItem key={service.id} service={service} />
                ))
              ) : (
                <div className="py-12 text-center text-slate-500">
                  No services available in this category yet.
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Cart & Offers */}
          <div className="w-full xl:w-[340px] shrink-0 hidden lg:block lg:sticky lg:top-48">
             <CartSidebar />
          </div>

        </div>
      </div>
    </div>
  );
};

// --- EXISTING COMPONENTS (Simplified for brevity) ---

const Navbar = ({ onHomeClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Sahaay</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={onHomeClick} className="text-indigo-600 font-medium">Home</button>
            <button className="text-slate-600 hover:text-indigo-600 transition-colors">Services</button>
            <button className="text-slate-600 hover:text-indigo-600 transition-colors">About Us</button>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2 text-slate-700 font-medium hover:text-indigo-600 transition-colors">Login</button>
            <button className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// ... (Landing Page components)

export default function Services() {
  const [activePage, setActivePage] = useState('home'); // 'home' | 'category'
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigateToCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setActivePage('category');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setActivePage('home');
    setSelectedCategory(null);
    window.scrollTo(0, 0);
  };

  if (activePage === 'category' && selectedCategory) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
        <Navbar onHomeClick={navigateToHome} />
        <CategoryDetailsPage categoryName={selectedCategory} onBack={navigateToHome} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">
      <Navbar onHomeClick={navigateToHome} />
      
      {/* Quick Demo Hero for Navigation */}
      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-6 text-slate-900">Professional Home Services</h1>
        <p className="text-xl text-slate-500 mb-12">Click a category below to see the new UI implementation.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Mock Service Cards linking to new UI */}
          <div 
            onClick={() => navigateToCategory('Electrical')}
            className="cursor-pointer group bg-white border border-slate-200 p-8 rounded-2xl hover:shadow-xl hover:border-indigo-500 transition-all text-left"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Electrical</h3>
            <p className="text-slate-500">Switches, fans, lights, and appliance repairs.</p>
          </div>

          <div 
            onClick={() => navigateToCategory('Plumbing')}
            className="cursor-pointer group bg-white border border-slate-200 p-8 rounded-2xl hover:shadow-xl hover:border-indigo-500 transition-all text-left"
          >
            <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Droplets className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Plumbing</h3>
            <p className="text-slate-500">Taps, basins, leaks, and blocked drains.</p>
          </div>

           <div 
            onClick={() => navigateToCategory('Gardening')}
            className="cursor-pointer group bg-white border border-slate-200 p-8 rounded-2xl hover:shadow-xl hover:border-indigo-500 transition-all text-left"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Gardening</h3>
            <p className="text-slate-500">Plant care, landscaping, and cleanups.</p>
          </div>
        </div>
      </div>
    </div>
  );
}