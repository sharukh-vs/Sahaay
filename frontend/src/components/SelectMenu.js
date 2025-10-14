'use client'

import { useState } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon, ChevronDownIcon, MapPinIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'
import LocationDialog from './LocationDialog'


export default function SelectMenu({ label, placeholder }) {
  const [location, setLocation] = useState(placeholder)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("Select Location")

  return (
    <>
    <button
      type="button"
      onClick={() => setIsDialogOpen(true)}
      className="grid w-full cursor-pointer grid-cols-1 rounded-md bg-gray-700/50 py-1.5 pr-6 pl-6 text-left text-white outline-1 -outline-offset-1 outline-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500 sm:text-sm/6"
    >
      <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
        <MapPinIcon className="size-5 shrink-0 rounded-full bg-gray-700 outline -outline-offset-1 outline-white/10" />
        <span className="block truncate text-gray-300 font-semibold hover:text-white">{selectedLocation}</span>
      </span>
      <ChevronDownIcon
        aria-hidden="true"
        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-400 sm:size-4 hover:text-white"
      />
    </button>
    <LocationDialog 
      isOpen={isDialogOpen} 
      onClose={()=>setIsDialogOpen(false)}
      onSelectLocation={(loc) => setSelectedLocation(loc)}/>
    </>

  )
}
