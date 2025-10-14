import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from "react";

export default function LocationDialog({ isOpen, onClose, onSelectLocation }) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])

  // Mock: Replace with real API (Google Places, OpenStreetMap, etc.)
  const locations = ["Kochi", "Thiruvananthapuram", "Bangalore", "Chennai", "Mumbai"]

  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const timerId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300)

    return () => clearTimeout(timerId);
  }, [query])

  const handleSearch = (value) => {
    setQuery(value)
    if (value.trim() === "") {
      setSuggestions([])
    } else {
      setSuggestions(
        locations.filter((loc) =>
          loc.toLowerCase().includes(value.toLowerCase())
        )
      )
    }
  }

  const fetchSuggestions = async (query) => {
    try {
      const myAppUserAgent = "Sahaay/1.0 (Sahaay; sharukhashfaq64@gmail.com)";
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=en&countrycodes=in`,
        {
          headers : {
            'User-Agent': myAppUserAgent
          }
        }
      )
      const data = await response.json();
      setSuggestions(data.map((item) => ({
        name: item.display_name,
        lat: item.lat,
        lon: item.lon
      })))

    } catch (err) {
      console.error('Error in suggesting location ', err);
    }
  }

  const handleSelect = (location) => {
    onSelectLocation(location)
    setQuery("");
    onClose()
  }

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const loc = `Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`
          const myAppUserAgent = "Sahaay/1.0 (Sahaay; sharukhashfaq64@gmail.com)";
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
              {
                headers: {
                  'User-Agent': myAppUserAgent
                }
              }
            );
            const data = await response.json();
            if (data && data.display_name) {
              handleSelect(data.display_name.split(',')[0]);
            } else {
              alert("Could not find your location");
            }
          } catch (err) {
            console.error("Error detecting location:", err);
            alert("Unable to detect location. Please allow location access in your browser settings.");
          }
          console.log(loc);

        },
        (error) => {
          console.error("Error detecting location:", error)
          alert("Unable to detect location. Please allow location access.")
        }
      )
    } else {
      alert("Geolocation not supported in this browser.")
    }
  }
  return (
    // <Dialog open={isOpen} onClose={onClose} className="relative z-50">
    //     <DialogBackdrop
    //   transition
    //   className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
    // />
    // <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
    //     <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
    //         <DialogPanel
    //       transition
    //       className="relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
    //     >
    //       <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
    //         <div className="sm:flex sm:items-start">
    //           <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mx-0 sm:size-10">
    //             <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-400" />
    //           </div>
    //           <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
    //             <DialogTitle as="h3" className="text-base font-semibold text-white">
    //               Deactivate account
    //             </DialogTitle>
    //             <div className="mt-2">
    //               <p className="text-sm text-gray-400">
    //                 Are you sure you want to deactivate your account? All of your data will be permanently removed.
    //                 This action cannot be undone.
    //               </p>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //       <div className="bg-gray-700/25 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
    //         <button
    //           type="button"
    //           onClick={onClose}
    //           className="inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400 sm:ml-3 sm:w-auto"
    //         >
    //           Deactivate
    //         </button>
    //         <button
    //           type="button"
    //           data-autofocus
    //           onClick={onClose}
    //           className="mt-3 inline-flex w-full justify-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20 sm:mt-0 sm:w-auto"
    //         >
    //           Cancel
    //         </button>
    //       </div>
    //     </DialogPanel>
    //     </div>


    // </div>

    // </Dialog>
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-lg">
          <DialogTitle className="text-lg font-medium text-white flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-indigo-400" />
            Select your location
          </DialogTitle>

          {/* Search box */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a city..."
            className="mt-4 w-full rounded-md bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-2 rounded-md bg-gray-700 divide-y divide-gray-600">
              {suggestions.map((loc) => (
                <button
                  key={`${loc.lat}-${loc.lon}`}
                  onClick={() => handleSelect(loc.name.split(',')[0])}
                  className="w-full px-3 py-2 text-left text-white hover:bg-gray-600"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          )}

          {/* Auto detect */}
          <button
            onClick={handleDetectLocation}
            className="mt-4 w-full rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400"
          >
            Detect My Location
          </button>

          {/* Close */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}