/**
 * Sahaay Service Matching Algorithm
 *
 * Scores and ranks service providers for a given service request.
 * Uses a weighted multi-factor scoring model:
 *
 * Factors & Weights:
 *  1. Category Match         — 30%  (exact category + subcategory + tag overlap)
 *  2. Location Proximity     — 25%  (geospatial distance vs provider service radius)
 *  3. Rating & Reputation    — 20%  (avg rating, completion rate, total reviews)
 *  4. Availability           — 10%  (can they work on preferred date/time)
 *  5. Budget Compatibility   — 10%  (does provider's price range fit user's budget)
 *  6. Subscription Tier      —  5%  (premium subscribers get a visibility boost)
 *
 * Max possible score: 100
 */

const { ServiceProvider } = require('../models/serviceProvider.model');
const Service = require('../models/service.model');

// ─── Scoring Helpers ──────────────────────────────────────────────────────────

/**
 * Calculates the Haversine distance (km) between two [lng, lat] coordinate pairs.
 */
function haversineDistance([lng1, lat1], [lng2, lat2]) {
    const R = 6371; // Earth radius km
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Jaccard similarity between two arrays (0-1).
 */
function jaccardSimilarity(setA, setB) {
    if (!setA.length && !setB.length) return 0;
    const a = new Set(setA.map((x) => x.toLowerCase()));
    const b = new Set(setB.map((x) => x.toLowerCase()));
    const intersection = [...a].filter((x) => b.has(x)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 0 : intersection / union;
}

/**
 * Returns the day name (lowercase) for a given Date.
 */
function getDayName(date) {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
        date.getDay()
    ];
}

// ─── Factor Scorers ───────────────────────────────────────────────────────────

/** 1. Category & Tag Match Score (0–100) */
function scoreCategoryMatch(request, provider, services) {
    // Does the provider serve this category?
    const exactCategoryMatch = provider.categories?.includes(request.category) ? 50 : 0;

    // Tag overlap across provider's services
    const allProviderTags = services.flatMap((s) => s.tags || []);
    const tagScore = jaccardSimilarity(request.tags || [], allProviderTags) * 30;

    // Has an active service listing in this category?
    const categoryServiceMatch =
        services.some((s) => s.category === request.category && s.status === 'active') ? 20 : 0;

    return Math.min(100, exactCategoryMatch + tagScore + categoryServiceMatch);
}

/** 2. Proximity Score (0–100) */
function scoreProximity(request, provider) {
    const userCoords = request.location?.coordinates;
    const providerCoords = provider.location?.coordinates;

    if (
        !userCoords || !providerCoords ||
        (userCoords[0] === 0 && userCoords[1] === 0) ||
        (providerCoords[0] === 0 && providerCoords[1] === 0)
    ) {
        return 50; // No location data — neutral score
    }

    const distanceKm = haversineDistance(userCoords, providerCoords);
    const radius = provider.serviceRadius || 10;

    if (distanceKm > radius * 1.5) return 0;       // Way outside range
    if (distanceKm <= radius * 0.25) return 100;   // Very close
    if (distanceKm <= radius * 0.5) return 80;
    if (distanceKm <= radius) return 60;
    return 30;                                      // Just outside radius but not too far
}

/** 3. Rating & Reputation Score (0–100) */
function scoreReputation(provider) {
    const avgRating = provider.averageRating || 0;          // 0-5
    const completionRate = provider.completionRate || 100;  // 0-100
    const totalRatings = provider.totalRatings || 0;

    // Bayesian average: weight raw rating by review count
    const ratingWeight = Math.min(totalRatings / 20, 1); // full weight at 20+ reviews
    const bayesianRating = (avgRating * ratingWeight + 3.5 * (1 - ratingWeight)); // 3.5 = prior mean
    const ratingScore = (bayesianRating / 5) * 60;

    const completionScore = (completionRate / 100) * 25;
    const responseScore = provider.responseTime
        ? Math.max(0, 15 - provider.responseTime) // lower responseTime → higher score
        : 7.5;

    return Math.min(100, ratingScore + completionScore + responseScore);
}

/** 4. Availability Score (0–100) */
function scoreAvailability(request, provider) {
    if (!request.preferredDate) return 70; // No date preference — assume mostly available

    const preferredDate = new Date(request.preferredDate);
    const dayName = getDayName(preferredDate);
    const dayAvailability = provider.availability?.[dayName];

    if (!dayAvailability) return 70;
    if (!dayAvailability.open) return 0;

    // If time slot preferred, check overlap
    if (request.preferredTimeSlot && dayAvailability.from && dayAvailability.to) {
        const [reqHour] = request.preferredTimeSlot.split(':').map(Number);
        const [fromHour] = dayAvailability.from.split(':').map(Number);
        const [toHour] = dayAvailability.to.split(':').map(Number);
        if (reqHour >= fromHour && reqHour < toHour) return 100;
        return 40;
    }

    return 85; // Available that day but no time slot to check
}

/** 5. Budget Compatibility Score (0–100) */
function scoreBudget(request, services) {
    const userMin = request.budgetMin || 0;
    const userMax = request.budgetMax || Infinity;

    if (!userMax || userMax === Infinity) return 70; // No budget constraint

    const activeServices = services.filter((s) => s.status === 'active' && s.category === request.category);
    if (!activeServices.length) return 50;

    // Find best price match
    const compatible = activeServices.some(
        (s) =>
            (s.pricingType === 'quote_based') ||
            (s.priceMin <= userMax && (s.priceMax === 0 || s.priceMax >= userMin))
    );

    if (compatible) {
        const perfectMatch = activeServices.some(
            (s) => s.priceMin >= userMin && s.priceMax <= userMax
        );
        return perfectMatch ? 100 : 70;
    }
    return 10;
}

/** 6. Subscription Tier Boost (0–100) */
function scoreSubscriptionTier(provider) {
    // White collar gets priority boost, blue medium, gray minimal
    if (!provider.activeSubscription) return 0;
    const collarType = provider.collarType;
    if (collarType === 'white') return 100;
    if (collarType === 'blue') return 60;
    if (collarType === 'gray') return 30;
    return 0;
}

// ─── Weights ──────────────────────────────────────────────────────────────────

const WEIGHTS = {
    category:     0.30,
    proximity:    0.25,
    reputation:   0.20,
    availability: 0.10,
    budget:       0.10,
    subscription: 0.05,
};

// ─── Main Matching Function ───────────────────────────────────────────────────

/**
 * Match and rank providers for a service request.
 *
 * @param {Object} request - ServiceRequest mongoose document
 * @param {Object} options
 * @param {number} options.maxResults - Maximum providers to return (default: 20)
 * @param {number} options.minScore   - Minimum score threshold (default: 10)
 * @returns {Array<{ provider, matchScore, breakdown }>}
 */
async function matchProviders(request, options = {}) {
    const { maxResults = 20, minScore = 10 } = options;

    // 1. Fetch candidate providers — geospatial pre-filter
    const userCoords = request.location?.coordinates;
    let providerQuery = {
        isActive: true,
        isVerified: true,
        verificationStatus: 'approved',
    };

    // Category pre-filter
    if (request.category) {
        providerQuery.categories = request.category;
    }

    // Geospatial filter (within 50km to keep candidates broad)
    let candidates;
    if (userCoords && !(userCoords[0] === 0 && userCoords[1] === 0)) {
        candidates = await ServiceProvider.find({
            ...providerQuery,
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: userCoords },
                    $maxDistance: 50000, // 50km in metres
                },
            },
        }).limit(100);
    } else {
        candidates = await ServiceProvider.find(providerQuery).limit(100);
    }

    if (!candidates.length) return [];

    // 2. Fetch services for all candidates in one query
    const providerIds = candidates.map((p) => p._id);
    const services = await Service.find({ provider: { $in: providerIds } });

    // Group services by provider
    const servicesByProvider = {};
    for (const s of services) {
        const pid = s.provider.toString();
        if (!servicesByProvider[pid]) servicesByProvider[pid] = [];
        servicesByProvider[pid].push(s);
    }

    // 3. Score each provider
    const scored = candidates.map((provider) => {
        const pid = provider._id.toString();
        const providerServices = servicesByProvider[pid] || [];

        const breakdown = {
            category:     scoreCategoryMatch(request, provider, providerServices),
            proximity:    scoreProximity(request, provider),
            reputation:   scoreReputation(provider),
            availability: scoreAvailability(request, provider),
            budget:       scoreBudget(request, providerServices),
            subscription: scoreSubscriptionTier(provider),
        };

        const matchScore =
            breakdown.category     * WEIGHTS.category +
            breakdown.proximity    * WEIGHTS.proximity +
            breakdown.reputation   * WEIGHTS.reputation +
            breakdown.availability * WEIGHTS.availability +
            breakdown.budget       * WEIGHTS.budget +
            breakdown.subscription * WEIGHTS.subscription;

        return {
            provider,
            matchScore: Math.round(matchScore * 10) / 10,
            breakdown,
        };
    });

    // 4. Filter by minimum score and sort descending
    return scored
        .filter((s) => s.matchScore >= minScore)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxResults);
}

/**
 * Quick search score — for sorting search results (doesn't need a full request object).
 * Used when searching providers directly (keyword + location + category).
 */
async function scoreSearchResults(providers, searchParams = {}) {
    const { category, coordinates } = searchParams;

    return providers.map((provider) => {
        let score = 0;

        // Category bonus
        if (category && provider.categories?.includes(category)) score += 30;

        // Proximity
        if (coordinates) {
            const dist = haversineDistance(coordinates, provider.location?.coordinates || [0, 0]);
            if (dist < 5) score += 25;
            else if (dist < 15) score += 15;
            else if (dist < 30) score += 5;
        }

        // Rating
        score += (provider.averageRating || 0) * 5; // up to 25

        // Subscription tier
        if (provider.collarType === 'white') score += 15;
        else if (provider.collarType === 'blue') score += 8;
        else if (provider.collarType === 'gray') score += 3;

        return { ...provider.toObject(), _searchScore: Math.round(score) };
    }).sort((a, b) => b._searchScore - a._searchScore);
}

module.exports = { matchProviders, scoreSearchResults, haversineDistance };
