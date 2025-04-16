import { useState, useEffect } from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { FiList, FiCalendar, FiClock, FiToggleLeft, FiToggleRight, FiTrash2, FiEdit, FiUserPlus, FiUsers, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/Admin/AdminLayout';
import LoadingBar from '../../components/LoadingBar';
import TableSkeleton from '../../components/Admin/TableSkeleton';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !['ADMIN', 'HUMAS'].includes(session.user.role)) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  return {
    props: { 
      user: {
        role: session.user.role
      }
    }
  };
}

export default function EventManagement({ user }) {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showPanitiaModal, setShowPanitiaModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableVisitors, setAvailableVisitors] = useState([]);
  const [selectedEventParticipants, setSelectedEventParticipants ] = useState([]);
  const [selectedVisitors , setSelectedVisitors ] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEventParticipants = async (eventId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participants`);
      const data = await res.json();
      setSelectedEventParticipants(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setIsLoading(false);
    }
  };

  const fetchAvailableVisitors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tamu?unassigned=true');
      const data = await res.json();
      setAvailableVisitors(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setIsLoading(false);
    }
  };

  const handleOpenParticipantModal = async (eventId) => {
    setSelectedEventId(eventId);
    await Promise.all([
      fetchEventParticipants(eventId),
      fetchAvailableVisitors()
    ]);
    setShowParticipantModal(true);
  };
  
  const handleVisitorAssignment = async () => {
    try {
      const res = await fetch(`/api/events/${selectedEventId}/assign-visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorIds: selectedVisitors })
      });
  
      if (res.ok) {
        setSelectedVisitors([]);
        fetchEventParticipants(selectedEventId);
        fetchEvents();
        setShowParticipantModal(true);
      }
    } catch (error) {
      console.error('Error assigning visitors:', error);
    }
  };
  const fetchEventPanitia = async (eventId) => {
    const res = await fetch(`/api/events/${eventId}/panitia`);
    const data = await res.json();
    setSelectedUsers(data.map(ep => ep.user.id));
    setIsLoading(false);
  };
  
  const handlePanitiaAssignment = async () => {
    const res = await fetch(`/api/events/${selectedEventId}/panitia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: selectedUsers })
    });
  
    if (res.ok) {
      setShowPanitiaModal(false);
      fetchEvents();
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users?role=PANITIA');
    const data = await res.json();
    setAvailableUsers(data);
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const resetForm  = () => {   
    setIsEditing(false);
    setFormData({
      id: null,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      isActive: true
    })
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/events/${formData.id}` : '/api/events';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      fetchEvents();
      setShowModal(false);
      resetForm();
    }
  };
  const handleEdit = (event) => {
    setFormData({
      id: event.id,
      name: event.name,
      description: event.description,
      startDate: event.startDate.slice(0, 16),
      endDate: event.endDate.slice(0, 16),
      isActive: event.isActive
    });
    setIsEditing(true);
    setShowModal(true);
  };
  const handleRemoveFromEvent = async (tamuId) => {
    if (!confirm('Are you sure you want to remove this visitor from the event?')) return;
    
    try {
      const res = await fetch(`/api/tamu/${tamuId}/remove-from-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tamuId })
      });

      if (res.ok) {
        fetchEventParticipants(selectedEventId);
        fetchEvents(); // To update the stats
      } else {
        alert('Failed to remove visitor from event');
      }
    } catch (error) {
      console.error('Error removing visitor:', error);
      alert('Error removing visitor from event');
    }
  };
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchEvents();
      }
    }
  };
  const handleToggleActive = async (id) => {
    setIsLoading(true);
    try {
      const event = events.find(e => e.id === id);
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !event.isActive })
      });
      
      if (res.ok) {
        alert('Event status updated successfully');
        fetchEvents();
      } else {
        console.error('Failed to update event status');
      }
    } catch (error) {
      console.error('Error updating event status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout userRole={user.role}>
      <div className="container mx-auto p-2 sm:p-6 pb-20 md:pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FiCalendar className="text-blue-500" /> Event Management
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <FiCalendar /> Add New Event
          </button>
        </div>

        {/* Events List */}
        {isLoading ? (
          <TableSkeleton columns={4} />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{event.name}</span>
                          <span className="text-xs text-gray-500 mt-1 lg:hidden">{event.description}</span>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 lg:hidden">
                            <FiCalendar className="w-3 h-3" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-4">
                        <div className="text-sm text-gray-500">{event.description}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <FiCalendar className="text-gray-400" />
                            {new Date(event.startDate).toLocaleDateString()}
                          <FiClock className="text-gray-400 ml-2" />
                            {new Date(event.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs font-medium">
                          <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded">
                            <FiUsers className="w-3 h-3" />
                            <span>{event.stats.totalPeserta} peserta</span>
                          </div>
                          <div className="text-gray-500">
                            (L: {event.stats.totalLaki} / P: {event.stats.totalPerempuan})
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <button 
                          onClick={() => handleToggleActive(event.id)}
                          disabled={isLoading}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm ${
                            event.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {event.isActive ? <FiToggleRight className="text-lg" /> : <FiToggleLeft className="text-lg" />}
                          <span className="hidden sm:inline">{event.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex flex-row gap-2 justify-start">
                          <button
                            onClick={() => handleOpenParticipantModal(event.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Participants"
                          >
                            <FiUsers className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(event)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                          {user.role === 'ADMIN' && (
                            <>
                              <button
                                onClick={() => {
                                  setIsLoading(true);
                                  setSelectedEventId(event.id);
                                  fetchUsers();
                                  fetchEventPanitia(event.id);
                                  setShowPanitiaModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Tambahkan Panitia"
                              >
                                <FiUserPlus className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Participant Modal */}
        {showParticipantModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Event Participants</h3>
                <button onClick={() => setShowParticipantModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Current Participants */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Current Participants</h4>
                    <div className="overflow-x-auto">

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="text-xs text-gray-500 uppercase">
                            <th className="px-4 py-2 text-left">Nama</th>
                            <th className="px-4 py-2 text-left">Asal</th>
                            <th className="px-4 py-2 text-left">Kontak</th>
                            <th className="px-4 py-2 text-left">Jumlah</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedEventParticipants.map(participant => (
                            <tr key={participant.id} className="text-sm hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">{participant.nama}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {participant.kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                </div>
                              </td>
                              <td className="px-4 py-3">{participant.asal}</td>
                              <td className="px-4 py-3">{participant.noKontak}</td>
                              <td className="px-4 py-3">
                                <div className="text-sm">{participant.jumlahOrang} orang</div>
                                <div className="text-xs text-gray-500">
                                  (L: {participant.jumlahLaki} / P: {participant.jumlahPerempuan})
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleRemoveFromEvent(participant.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Remove from Event"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Available Visitors */}
                  {availableVisitors.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Add Existing Visitors</h4>
                      <div className="space-y-2">
                        {availableVisitors.map(visitor => (
                          <label key={visitor.id} className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedVisitors.includes(visitor.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVisitors([...selectedVisitors, visitor.id]);
                                } else {
                                  setSelectedVisitors(selectedVisitors.filter(id => id !== visitor.id));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <div className="ml-3">
                              <div className="text-sm font-medium">{visitor.nama}</div>
                              <div className="text-xs text-gray-500">
                                {visitor.keperluan} • {visitor.jumlahOrang} orang • {visitor.kelamin}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setShowParticipantModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
                >
                  Close
                </button>
                {availableVisitors.length > 0 && (
                  <button
                    onClick={handleVisitorAssignment}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    disabled={selectedVisitors.length === 0}
                  >
                    Add Selected Visitors
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Modals - Update for better mobile experience */}
        {showPanitiaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Tambahkan Panitia</h3>
                {availableUsers.length > 0 ? (
                  <div className="space-y-2">
                    {availableUsers.map(user => (
                      <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="mr-3 h-4 w-4"
                        />
                        <span className="text-sm">{user.name || user.username}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No other committee members available
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={() => setShowPanitiaModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePanitiaAssignment}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={!availableUsers.length}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{isEditing ? 'Edit Event' : 'Add New Event'}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Event Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active</label>
                </div>
      
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {isEditing ? 'Update Event' : 'Add Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    {isLoading && (<LoadingBar /> )}
    </AdminLayout>
  );
}