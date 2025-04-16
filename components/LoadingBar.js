const LoadingBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-100">
        <div className="h-full bg-blue-500 animate-loading-bar"></div>
      </div>
      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingBar;