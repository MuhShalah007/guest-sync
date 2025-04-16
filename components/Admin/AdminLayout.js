import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiUsers, FiCalendar, FiMenu, FiX, FiHome, FiLogOut } from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';

export default function AdminLayout({ children, userRole }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const menuItems = [
    {
      href: '/admin',
      icon: <FiHome className="w-6 h-6" />,
      title: 'Dashboard',
      roles: ['ADMIN', 'HUMAS', 'PANITIA']
    },
    {
      href: '/admin/users',
      icon: <FiUsers className="w-6 h-6" />,
      title: 'Users',
      roles: ['ADMIN']
    },
    {
      href: '/admin/events',
      icon: <FiCalendar className="w-6 h-6" />,
      title: 'Events',
      roles: ['ADMIN', 'HUMAS']
    }
  ];

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' });
  };

  useEffect(() => {
    if (session?.user && 'serviceWorker' in navigator && 'Notification' in window) {
      const setupPushNotification = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;

          const registration = await navigator.serviceWorker.register('/sw.js');
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          });

          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });
        } catch (error) {
          console.error('Push notification setup failed:', error);
        }
      };

      setupPushNotification();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for desktop - removed hidden class and fixed visibility */}
      <aside className="w-64 bg-white shadow-lg md:flex flex-col hidden">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4">
          {menuItems.map((item) => (
            item.roles.includes(userRole) && (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  router.pathname === item.href
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            )
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut className="w-6 h-6" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => (
            item.roles.includes(userRole) && (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 ${
                  router.pathname === item.href
                    ? 'text-blue-500'
                    : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.title}</span>
              </Link>
            )
          ))}
        </div>
      </nav>
    </div>
  );
}