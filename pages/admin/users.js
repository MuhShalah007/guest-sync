import { useState, useEffect } from 'react';
import { getCsrfToken } from 'next-auth/react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import AdminLayout from '../../components/Admin/AdminLayout';
import { FiEdit2, FiUsers, FiTrash2, FiUserPlus, FiX, FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';
import { HiChevronUpDown } from "react-icons/hi2";
import TableSkeleton from '../../components/Admin/TableSkeleton';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
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

export default function UserManagement({ user }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
      id: null,
      username: '',
      name: '',
      role: '',
      password: '',
      createdAt: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const sortData = (data) => {
    if (!sortConfig.key) return data;
  
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filterData = (data) => {
    return data.filter(item => 
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
    const url = isEditing ? `/api/users/${formData.id}` : '/api/users';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      fetchUsers();
      setShowModal(false);
      resetForm();
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUsers();
      }
    }
  };
  const highlightText = (text, search) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === search.toLowerCase() 
        ? <span key={i} className="bg-yellow-200">{part}</span>
        : part
    );
  };
  return (
    <AdminLayout userRole={user.role}>
      <div className="container mx-auto p-2 sm:p-6 pb-20 md:pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FiUsers className="text-blue-500" /> User Management
          </h1>
          <button 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FiUserPlus /> Add New User
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold">{isEditing ? 'Edit User' : 'Add New User'}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border p-2 rounded"
                  />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Select Role</option>
                    <option value="PANITIA">Panitia</option>
                    <option value="HUMAS">Humas</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    {isEditing ? 'Update' : 'Add'} User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users List */}
        {isLoading ? (
          <TableSkeleton columns={4} />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="p-2 sm:p-4 border-b">
              <div className="flex items-center gap-2">
                <FiSearch className="text-gray-400 min-w-[20px]" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="min-w-full overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                {/* ... thead remains the same ... */}
                <tbody className="divide-y divide-gray-200">
                  {users.length > 0 ? (
                    sortData(filterData(users)).map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-sm">{highlightText(user.username, searchTerm)}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-sm">{highlightText(user.name || '', searchTerm)}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-green-100 text-green-800'
                              : user.role === 'HUMAS'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {highlightText(
                              user.role === 'ADMIN' 
                                ? 'admin' 
                                : user.role === 'HUMAS' 
                                  ? 'humas' 
                                  : 'panitia',
                              searchTerm
                            )}
                          </span>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-sm">
                          <div className="flex flex-row gap-2 justify-start">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <FiEdit2 className="w-4 h-4" /> 
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <FiTrash2 className="w-4 h-4" /> 
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}