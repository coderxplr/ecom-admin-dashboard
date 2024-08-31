import React, { useState } from 'react';
import { Card } from 'antd';
import CategoryForm from './components/CategoryForm';
import ProductForm from './components/ProductForm';

const App = () => {
  const [view, setView] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center  p-6">
      <h1 className="text-4xl font-bold text-gray-700 mb-8">Admin Dashboard</h1>
      <div className="flex space-x-4 mb-8">
        <Card
          title="Categories"
          className="cursor-pointer w-64 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
          onClick={() => setView('category')}
        >
          <p className="text-gray-600">Manage Categories</p>
        </Card>
        <Card
          title="Products"
          className="cursor-pointer w-64 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
          onClick={() => setView('product')}
        >
          <p className="text-gray-600">Manage Products</p>
        </Card>
      </div>

      <div className="w-full max-w-3xl">
        {view === 'category' && <CategoryForm />}
        {view === 'product' && <ProductForm />}
      </div>
    </div>
  );
};

export default App;
