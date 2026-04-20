import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Star, SlidersHorizontal, Map, List, X, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import axiosInstance from '../../axios/axiosInstance';

const CATEGORIES = [
    'Plumbing','Electrical','Carpentry','Painting','Cleaning','Landscaping',
    'HVAC','Roofing','Appliance Repair','Pest Control','Photography',
    'Catering','Event Management','Tutoring','Medical','Legal',
    'Accounting','IT Support','Beauty & Wellness','Automotive','Moving',
];

const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
];

const ProviderCard = ({ provider }) => (
    <Link to={`/user/providers/${provider._id}`}
        className="card p-5 hover:border-indigo-500/30 hover:shadow-glow-sm transition-all duration-300 group flex flex-col gap-3">
        <div className="flex items-start gap-3">
            <img
                src={provider.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.businessName || 'P')}&background=6366f1&color=fff&size=80`}
                alt={provider.businessName}
                className="w-14 h-14 rounded-2xl object-cover border border-white/10 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{provider.businessName}</h3>
                    {provider.isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                </div>
                <p className="text-sm text-slate-400 mt-0.5 truncate">{provider.categories?.slice(0, 3).join(' · ')}</p>
                {provider.businessAddress?.city && (
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3 h-3" />{provider.businessAddress.city}, {provider.businessAddress.state}
                    </p>
                )}
            </div>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(provider.averageRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                ))}
                <span className="text-sm font-semibold text-white ml-1">{provider.averageRating?.toFixed(1) || 'New'}</span>
                <span className="text-xs text-slate-500">({provider.totalRatings || 0} reviews)</span>
            </div>
            <span className={`badge ${provider.collarType === 'white' ? 'badge-primary' : provider.collarType === 'blue' ? 'badge-neutral' : 'badge-warning'}`}>
                {provider.collarType} collar
            </span>
        </div>

        {provider.businessDescription && (
            <p className="text-sm text-slate-400 line-clamp-2">{provider.businessDescription}</p>
        )}

        <div className="flex items-center gap-2 pt-1 border-t border-white/8">
            <span className="text-xs text-slate-500">
                {provider.totalJobsCompleted || 0} jobs · {Math.round(provider.completionRate || 100)}% completion
            </span>
            <span className="ml-auto badge badge-success text-xs">Contact Provider</span>
        </div>
    </Link>
);

// Lazy load Leaflet map component
const MapView = ({ providers }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;
        // Dynamic import of Leaflet
        import('leaflet').then((L) => {
            import('leaflet/dist/leaflet.css').then(() => {
                // Fix default icon issue
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });

                const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India center
                mapInstanceRef.current = map;

                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                    maxZoom: 19,
                }).addTo(map);

                providers.forEach((p) => {
                    const coords = p.location?.coordinates;
                    if (coords && coords[0] !== 0 && coords[1] !== 0) {
                        const marker = L.marker([coords[1], coords[0]]).addTo(map);
                        marker.bindPopup(`
                            <div style="font-family:Inter,sans-serif;min-width:160px">
                                <strong style="font-size:13px">${p.businessName}</strong>
                                <br/><span style="font-size:11px;color:#888">${p.categories?.[0] || ''}</span>
                                <br/><span style="font-size:12px">⭐ ${p.averageRating?.toFixed(1) || 'New'}</span>
                                <br/><a href="/user/providers/${p._id}" style="font-size:11px;color:#6366f1">View Profile →</a>
                            </div>
                        `);
                    }
                });
            });
        });
        return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
    }, [providers]);

    return <div ref={mapRef} className="w-full h-[500px] rounded-2xl overflow-hidden border border-white/10" />;
};

export default function ServiceSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [providers, setProviders] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [filters, setFilters] = useState({
        q: searchParams.get('q') || '',
        category: searchParams.get('category') || '',
        sort: 'popular',
        page: 1,
    });

    const search = useCallback(async (f) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (f.q) params.set('q', f.q);
            if (f.category) params.set('category', f.category);
            params.set('page', f.page);
            params.set('limit', 12);

            const res = await axiosInstance.get(`/services/providers/search?${params}`);
            setProviders(res.data.providers || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { search(filters); }, [filters, search]);

    const updateFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

    const handleSearch = (e) => {
        e.preventDefault();
        search(filters);
    };

    return (
        <UserLayout>
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="page-title">Find Services</h1>
                    <p className="page-subtitle">Discover and connect with verified service providers near you</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <div className="flex-1 flex items-center gap-3 input pr-3">
                        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <input
                            id="search-input"
                            type="text"
                            value={filters.q}
                            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                            placeholder="Search services, providers, categories..."
                            className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm w-full"
                        />
                        {filters.q && (
                            <button type="button" onClick={() => updateFilter('q', '')} className="text-slate-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary btn-md px-6">Search</button>
                </form>

                {/* Controls Row */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    {/* Category filter */}
                    <div className="relative">
                        <select
                            id="category-filter"
                            value={filters.category}
                            onChange={(e) => updateFilter('category', e.target.value)}
                            className="appearance-none input pr-8 py-2 text-sm cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            id="sort-filter"
                            value={filters.sort}
                            onChange={(e) => updateFilter('sort', e.target.value)}
                            className="appearance-none input pr-8 py-2 text-sm cursor-pointer"
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <span className="text-slate-400 text-sm ml-auto">
                        {loading ? '...' : `${total} provider${total !== 1 ? 's' : ''} found`}
                    </span>

                    {/* View toggle */}
                    <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-white/8">
                        <button id="list-view" onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <List className="w-4 h-4" />
                        </button>
                        <button id="map-view" onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <Map className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Active category badge */}
                {filters.category && (
                    <div className="flex items-center gap-2 mb-4">
                        <span className="badge badge-primary">
                            {filters.category}
                            <button onClick={() => updateFilter('category', '')} className="ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : providers.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No providers found</h3>
                        <p className="text-slate-400 text-sm">Try a different search term or category.</p>
                    </div>
                ) : viewMode === 'list' ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {providers.map((p) => <ProviderCard key={p._id} provider={p} />)}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setFilters((f) => ({ ...f, page: p }))}
                                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${filters.page === p ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <MapView providers={providers} />
                )}
            </div>
        </UserLayout>
    );
}
