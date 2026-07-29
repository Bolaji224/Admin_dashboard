import React from 'react'

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default PageLoader;