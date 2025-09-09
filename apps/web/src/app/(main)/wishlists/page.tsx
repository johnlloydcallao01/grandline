'use client';

import React from 'react';

/**
 * Wishlists Page - Display user's saved items
 * Features mock wishlist data with visually appealing design
 */
export default function WishlistsPage() {
  // Mock wishlist data
  const wishlistItems = [
    {
      id: 1,
      title: "Advanced React Development",
      category: "Programming",
      price: "$89.99",
      originalPrice: "$129.99",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      students: "12,450",
      instructor: "Sarah Johnson",
      duration: "8.5 hours",
      isOnSale: true
    },
    {
      id: 2,
      title: "UI/UX Design Masterclass",
      category: "Design",
      price: "$79.99",
      originalPrice: "$99.99",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      students: "8,230",
      instructor: "Mike Chen",
      duration: "12 hours",
      isOnSale: true
    },
    {
      id: 3,
      title: "Digital Marketing Strategy",
      category: "Marketing",
      price: "$59.99",
      originalPrice: "$89.99",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      students: "15,670",
      instructor: "Emma Davis",
      duration: "6 hours",
      isOnSale: false
    },
    {
      id: 4,
      title: "Machine Learning Fundamentals",
      category: "Data Science",
      price: "$149.99",
      originalPrice: "$199.99",
      image: "/api/placeholder/300/200",
      rating: 4.6,
      students: "9,840",
      instructor: "Dr. Alex Kumar",
      duration: "15 hours",
      isOnSale: true
    },
    {
      id: 5,
      title: "Photography Essentials",
      category: "Creative",
      price: "$39.99",
      originalPrice: "$59.99",
      image: "/api/placeholder/300/200",
      rating: 4.5,
      students: "6,120",
      instructor: "Lisa Park",
      duration: "4.5 hours",
      isOnSale: false
    },
    {
      id: 6,
      title: "Business Analytics with Excel",
      category: "Business",
      price: "$69.99",
      originalPrice: "$99.99",
      image: "/api/placeholder/300/200",
      rating: 4.4,
      students: "11,230",
      instructor: "Robert Wilson",
      duration: "7 hours",
      isOnSale: true
    }
  ];

  const handleRemoveFromWishlist = (id: number) => {
    // Mock function - would integrate with actual wishlist management
    console.log(`Removing item ${id} from wishlist`);
  };

  const handleAddToCart = (id: number) => {
    // Mock function - would integrate with cart system
    console.log(`Adding item ${id} to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlists</h1>
                <p className="mt-2 text-gray-600">{wishlistItems.length} courses saved for later</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i className="fa fa-share-alt mr-2"></i>
                  Share List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fa fa-heart text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding courses you&apos;re interested in!</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Browse Courses
            </button>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {/* Course Image */}
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <i className="fa fa-play-circle text-white text-4xl opacity-80"></i>
                  </div>
                  {item.isOnSale && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      SALE
                    </div>
                  )}
                  <button 
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <i className="fa fa-heart text-red-500"></i>
                  </button>
                </div>

                {/* Course Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <div className="flex items-center text-yellow-400">
                      <i className="fa fa-star text-xs"></i>
                      <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    By {item.instructor}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                    <span className="flex items-center">
                      <i className="fa fa-clock mr-1"></i>
                      {item.duration}
                    </span>
                    <span className="flex items-center">
                      <i className="fa fa-users mr-1"></i>
                      {item.students}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{item.price}</span>
                      {item.isOnSale && (
                        <span className="text-sm text-gray-500 line-through">{item.originalPrice}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAddToCart(item.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <i className="fa fa-shopping-cart mr-2"></i>
                Add All to Cart
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                <i className="fa fa-trash mr-2"></i>
                Clear Wishlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}