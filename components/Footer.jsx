import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-4 border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
          <span>&copy; {currentYear} {process.env.APP_NAME}</span>
          <span>•</span>
          <Link 
            href="/admin" 
            className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 