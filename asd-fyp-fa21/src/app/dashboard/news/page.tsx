import HealthNewsFeed from "@/components/health-news-feed";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-rose-400 font-medium">Mar 21 Friday</h1>
            <span className="text-gray-400 flex items-center">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-xs mr-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </span>
              69
            </span>
          </div>
          <button className="px-4 py-1.5 rounded border border-gray-700 text-sm hover:bg-gray-800 transition-colors">
            Mark All As Read
          </button>
        </div>

        <HealthNewsFeed />
      </div>
    </div>
  );
}
