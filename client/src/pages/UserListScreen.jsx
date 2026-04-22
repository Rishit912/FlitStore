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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Users</h1>
      <div className="app-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-2 text-left text-muted text-xs uppercase">
            <th className="p-3">ID</th>
            <th className="p-3">NAME</th>
            <th className="p-3">EMAIL</th>
            <th className="p-3">ADMIN</th>
            <th className="p-3">VERIFIED</th>
            <th className="p-3">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--border)]">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-surface-2/60">
              <td className="p-3 text-sm text-muted font-mono">{user._id}</td>
              <td className="p-3 text-foreground">{user.name}</td>
              <td className="p-3 text-muted">{user.email}</td>
              <td className="p-3">
                {user.isAdmin ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
              </td>
              <td className="p-3">
                {user.isVerified ? <span className="text-primary">Yes</span> : <span className="text-muted">No</span>}
              </td>
              <td className="p-3">
                <button onClick={() => deleteHandler(user._id)} className="text-red-500 hover:text-red-400">
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