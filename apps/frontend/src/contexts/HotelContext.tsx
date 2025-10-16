import React, { createContext, useContext, useState } from 'react'

interface Hotel {
  id: string
  name: string
  address?: string
  role: 'OWNER' | 'STAFF'
}

interface HotelContextType {
  selectedHotel: Hotel | null
  setSelectedHotel: (hotel: Hotel | null) => void
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  return (
    <HotelContext.Provider value={{ selectedHotel, setSelectedHotel }}>
      {children}
    </HotelContext.Provider>
  )
}

export function useHotel() {
  const context = useContext(HotelContext)
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider')
  }
  return context
}





