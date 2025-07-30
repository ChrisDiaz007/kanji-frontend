import { useState } from "react";
import type { KanjiData } from "../Kanji/Kanji";
import Kanji from "../Kanji/Kanji";
import "./Searchbar.css";

const Searchbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Kanji Search</h1>
          <p className="text-gray-600">Search for kanji characters and learn their meanings, readings, and more</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
            <p className="mt-2 text-gray-600">Searching for kanji...</p>
          </div>
        )}

        {/* Results */}
        {kanjiData && !loading && (
          <div className="animate-fade-in">
            <Kanji kanji={kanjiData} />
          </div>
        )}

        {/* Example Searches */}
        {!kanjiData && !loading && !error && (
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
