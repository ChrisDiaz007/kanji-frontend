import { useState } from "react";
import type { KanjiData } from "../Kanji/Kanji";
import Kanji from "../Kanji/Kanji";
import Camera from "../Camera/Camera";
import "./Searchbar.css";

const Searchbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'camera'>('search');

  const API_BASE_URL = "https://kanji-api-09daa91fbd9b.herokuapp.com/api/v1";

  const searchKanji = async (character: string) => {
    if (!character.trim()) {
      setError("Please enter a kanji character");
      return;
    }

    setLoading(true);
    setError(null);
    setKanjiData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/kanjis?character=${encodeURIComponent(character)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        setKanjiData(data[0]);
      } else {
        setError("Kanji not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch kanji data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchKanji(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchKanji(searchTerm);
    }
  };

  const handleKanjiDetected = (kanji: KanjiData) => {
    setKanjiData(kanji);
    setError(null);
    setLoading(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleTabChange = (tab: 'search' | 'camera') => {
    setActiveTab(tab);
    setError(null);
    setKanjiData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Kanji Search</h1>
          <p className="text-gray-600">Search for kanji characters or scan them with your camera</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => handleTabChange('search')}
              className={`flex-1 py-3 px-4 text-center font-semibold border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Text Search
            </button>
            <button
              onClick={() => handleTabChange('camera')}
              className={`flex-1 py-3 px-4 text-center font-semibold border-b-2 transition-colors ${
                activeTab === 'camera'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Camera Scan
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'search' && (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a kanji character (e.g., 家, 水, 火)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  maxLength={1}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="text-center text-gray-600 mb-4">
                <p>Take a photo or upload an image containing kanji characters</p>
              </div>
              <Camera
                onKanjiDetected={handleKanjiDetected}
                onError={handleError}
                onLoading={handleLoading}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">
              {activeTab === 'camera' ? 'Processing image...' : 'Searching for kanji...'}
            </p>
          </div>
        )}

        {/* Results */}
        {kanjiData && !loading && (
          <div className="animate-fade-in">
            <Kanji kanji={kanjiData} />
          </div>
        )}

        {/* Example Searches - Only show when no results and on search tab */}
        {!kanjiData && !loading && !error && activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Try these examples:</h3>
            <div className="flex flex-wrap gap-2 text-black">
              {["家", "水", "火", "山", "人", "大", "小", "日", "月", "木"].map((char) => (
                <button
                  key={char}
                  onClick={() => {
                    setSearchTerm(char);
                    searchKanji(char);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-medium transition-colors"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
