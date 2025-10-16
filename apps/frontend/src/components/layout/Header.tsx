import React from 'react'
import { useHotel } from '../../contexts/HotelContext'
import { Building2, ChevronDown } from 'lucide-react'

export function Header() {
  const { selectedHotel, setSelectedHotel } = useHotel()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">HotelEase</h1>
          {selectedHotel && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">{selectedHotel.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Hotel selector could go here */}
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    </header>
  )
}





