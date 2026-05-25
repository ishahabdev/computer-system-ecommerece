import { MdModeEdit } from "react-icons/md";
import Typography from "./common/Typography";
import { FaTrash } from "react-icons/fa6";

// Users List Component
const UsersList = ({ users, getSigleUser, deleteUser }) => {
    return (
        <div>
            <Typography varient="h3" className="mb-6">Users List</Typography>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className='bg-gray-700 text-white text-left'>
                            <th className='p-4 border border-gray-600'>ID</th>
                            <th className='p-4 border border-gray-600'>First Name</th>
                            <th className='p-4 border border-gray-600'>Last Name</th>
                            <th className='p-4 border border-gray-600'>Email</th>
                            <th className='p-4 border border-gray-600'>Role</th>
                            <th className='p-4 border border-gray-600'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user) => (
                            <tr key={user?.id} className='hover:bg-gray-50 transition'>
                                <td className='p-4 border border-gray-300'>{user?.id}</td>
                                <td className='p-4 border border-gray-300'>{user?.firstName}</td>
                                <td className='p-4 border border-gray-300'>{user?.lastName}</td>
                                <td className='p-4 border border-gray-300'>{user?.email}</td>
                                <td className='p-4 border border-gray-300'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {user?.role || 'user'}
                                    </span>
                                </td>
                                <td className='p-4 border border-gray-300'>
                                    <div className='flex items-center gap-3'>
                                        <button
                                            onClick={() => getSigleUser(user?.id)}
                                            className='p-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition'
                                            title="Edit User"
                                        >
                                            <MdModeEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user?.id)}
                                            className='p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition'
                                            title="Delete User"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users?.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center p-8 text-gray-500">
                                    No users found. Create your first user!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersList