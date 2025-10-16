import React, { useEffect, useState } from 'react'
import { useHotel } from '../contexts/HotelContext'
import { tenantAPI, reportsAPI } from '../lib/api'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Building2, Users, Bed, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

interface Hotel {
  id: string
  name: string
  address?: string
  role: 'OWNER' | 'STAFF'
}

interface Stats {
  totalRooms: number
  occupied: number
  occupancy: number
  revenueCents: number
}

export function Dashboard() {
  const { selectedHotel, setSelectedHotel } = useHotel()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHotels()
  }, [])

  useEffect(() => {
    if (selectedHotel) {
      loadStats()
    }
  }, [selectedHotel])

  const loadHotels = async () => {
    try {
      const response = await tenantAPI.myHotels()
      const hotelData = response.data.map((item: any) => ({
        id: item.hotel.id,
        name: item.hotel.name,
        address: item.hotel.address,
        role: item.role,
      }))
      setHotels(hotelData)
      
      // Auto-select first hotel if none selected
      if (hotelData.length > 0 && !selectedHotel) {
        setSelectedHotel(hotelData[0])
      }
    } catch (error) {
      toast.error('Failed to load hotels')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!selectedHotel) return
    
    try {
      const [occupancyRes, revenueRes] = await Promise.all([
        reportsAPI.occupancy(selectedHotel.id),
        reportsAPI.revenue(selectedHotel.id),
      ])
      
      setStats({
        totalRooms: occupancyRes.data.totalRooms,
        occupied: occupancyRes.data.occupied,
        occupancy: occupancyRes.data.occupancy,
        revenueCents: revenueRes.data.revenueCents,
      })
    } catch (error) {
      toast.error('Failed to load statistics')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hotels found</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have access to any hotels yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hotel Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Select Hotel:</label>
        <select
          value={selectedHotel?.id || ''}
          onChange={(e) => {
            const hotel = hotels.find(h => h.id === e.target.value)
            setSelectedHotel(hotel || null)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {hotels.map((hotel) => (
            <option key={hotel.id} value={hotel.id}>
              {hotel.name}
            </option>
          ))}
        </select>
        {selectedHotel && (
          <Badge variant={selectedHotel.role === 'OWNER' ? 'success' : 'default'}>
            {selectedHotel.role.toLowerCase()}
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardBody className="flex items-center">
              <div className="flex-shrink-0">
                <Bed className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRooms}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Occupied</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.occupied}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(stats.occupancy * 100)}%
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.revenueCents)}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">New Booking</p>
              <p className="text-xs text-gray-500">Create a new reservation</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Customer</p>
              <p className="text-xs text-gray-500">Register a new guest</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <Bed className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Rooms</p>
              <p className="text-xs text-gray-500">Update room details</p>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}





