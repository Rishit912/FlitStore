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
    <div className="fs-container fs-section">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-900">Users</h1>
        <span className="fs-pill">Admin</span>
      </div>
      <div className="fs-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/80 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Admin</th>
              <th className="p-4">Verified</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-sky-50/40 transition">
                <td className="p-4 text-xs font-mono text-slate-400">{user._id}</td>
                <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4">
                  {user.isAdmin ? <FaCheck className="text-emerald-500" /> : <FaTimes className="text-red-500" />}
                </td>
                <td className="p-4">
                  {user.isVerified ? <span className="text-sky-600 font-semibold">Yes</span> : <span className="text-slate-400">No</span>}
                </td>
                <td className="p-4">
                  <button onClick={() => deleteHandler(user._id)} className="text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListScreen;