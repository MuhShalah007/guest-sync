import { useState, useEffect } from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { FiCalendar, FiClock, FiToggleLeft, FiToggleRight, FiTrash2, FiEdit } from 'react-icons/fi';
// import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
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

  useEffect(() => {
    fetchEvents();
  }, []);

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
      startDate: event.startDate.slice(0, 16), // Format datetime-local
      endDate: event.endDate.slice(0, 16),
      isActive: event.isActive
    });
    setIsEditing(true);
    setShowModal(true);
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
    try {
      const event = events.find(e => e.id === id);
      setIsLoading(true);
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
      <div className="container mx-auto p-4 sm:p-6 pb-20 md:pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Event Management</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add New Event
          </button>
        </div>
  
        {/* Events List */}
        {isLoading ? (
          <TableSkeleton columns={4} />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map(event => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{event.name}</div>
                          <div className="md:hidden text-sm text-gray-500 mt-1">{event.description}</div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-4">
                          <div className="text-sm text-gray-500">{event.description}</div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <FiCalendar className="text-gray-400" />
                            {new Date(event.startDate).toLocaleDateString()}
                            <FiClock className="text-gray-400 ml-2" />
                            {new Date(event.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button 
                            onClick={() => handleToggleActive(event.id)}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                              event.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors`}
                          >
                            {event.isActive ? <FiToggleRight className="text-lg" /> : <FiToggleLeft className="text-lg" />}
                            {event.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(event)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <FiEdit />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            { user.role === 'ADMIN' && (
                              <button 
                                onClick={() => handleDelete(event.id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                              >
                                <FiTrash2 />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
    
            {/* Modal Form */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                  <form onSubmit={handleSubmit} className="p-6">
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}