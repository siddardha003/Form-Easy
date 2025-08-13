const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-blue-50 to-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Build Beautiful Forms{' '}
              <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                Without Code
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
              Create custom forms for your business with our drag-and-drop form
              builder. Powerful, flexible, and easy to use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                Start Building Free
              </button>
              <button className="border-2 border-blue-500 text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-50 transition-all">
                See Demo
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center md:justify-start gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((item) => (
                  <img
                    key={item}
                    src={`https://randomuser.me/api/portraits/women/${item + 20}.jpg`}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-600">
                  Trusted by 10,000+ businesses
                </p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs ml-1 text-gray-500">
                    4.9/5 (2,500+ reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative">
            <div className="relative rounded-xl shadow-2xl overflow-hidden border-8 border-white transform rotate-1">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Form Builder Interface"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
            </div>

            <div className="absolute -left-8 -bottom-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 animate-float">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-800">
                    Form Submitted!
                  </p>
                  <p className="text-xs text-gray-500">+1,200 today</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 -top-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 animate-float-reverse">
              <div className="flex items-center">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-800">
                    Fast Response
                  </p>
                  <p className="text-xs text-gray-500">98% satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;