import { useState, useEffect } from 'react';
import { getCsrfToken } from 'next-auth/react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import AdminLayout from '../../components/Admin/AdminLayout';
import { FiEdit2, FiUsers, FiTrash2, FiUserPlus, FiX } from 'react-icons/fi';
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

  return (
    <AdminLayout userRole={user.role}>
      <div className="container mx-auto p-6 pb-20 md:pb-6"> {/* Added padding for mobile nav */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiUsers className="text-blue-500" /> User Management
          </h1>
          <button 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all duration-200 flex items-center gap-2"
          >
            <FiUserPlus /> Add New User
          </button>
        </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="border p-2 rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="border p-2 rounded"
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="border p-2 rounded"
                >
                  <option value="PANITIA">Panitia</option>
                  <option value="HUMAS">Humas</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-green-100 text-green-800'
                              : user.role === 'HUMAS'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                              {user.role === 'ADMIN' 
                                ? 'admin' 
                                : user.role === 'HUMAS' 
                                  ? 'humas' 
                                  : 'panitia'}
                          </span></td>
                    <td className="px-6 py-4 space-x-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}