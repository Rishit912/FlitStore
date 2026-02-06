import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/users');
      setUsers(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        toast.success('User deleted');
        fetchUsers(); // Refresh the list
      } catch (err) {
        toast.error(err?.response?.data?.message || err.error);
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <table className="w-full bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">NAME</th>
            <th className="p-3">EMAIL</th>
            <th className="p-3">ADMIN</th>
            <th className="p-3">VERIFIED</th>
            <th className="p-3">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b">
              <td className="p-3 text-sm">{user._id}</td>
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">
                {user.isAdmin ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
              </td>
              <td className="p-3">
                {user.isVerified ? <span className="text-blue-500">Yes</span> : <span className="text-gray-400">No</span>}
              </td>
              <td className="p-3">
                <button onClick={() => deleteHandler(user._id)} className="text-red-600 hover:text-red-800">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListScreen;