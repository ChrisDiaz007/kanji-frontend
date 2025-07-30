export interface KanjiData {
  id: number;
  character: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  name_readings: string[];
  notes: string[];
  heisig_en: string;
  stroke_count: number;
  grade: number;
  jlpt_level: number;
  freq_mainichi_shinbun: number;
  unicode: string;
  created_at: string;
  updated_at: string;
}

interface KanjiProps {
  kanji: KanjiData;
}

const Kanji: React.FC<KanjiProps> = ({ kanji }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <div className="text-6xl font-bold text-gray-800 mb-2">{kanji.character}</div>
        <div className="text-sm text-gray-500">Unicode: {kanji.unicode}</div>
      </div>

      <div className="space-y-4">
        {/* Meanings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Meanings</h3>
          <div className="flex flex-wrap gap-2">
            {kanji.meanings.map((meaning, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {meaning}
              </span>
            ))}
          </div>
        </div>

        {/* Heisig Keyword */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Heisig Keyword</h3>
          <p className="text-gray-600">{kanji.heisig_en}</p>
        </div>

        {/* Readings */}
        <div className="grid grid-cols-2 gap-4">
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Kunyomi</h3>
            <div className="flex flex-wrap gap-1">
              {kanji.kunyomi.map((reading, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {reading}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Onyomi</h3>
            <div className="flex flex-wrap gap-1">
              {kanji.onyomi.map((reading, index) => (
                <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                  {reading}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Name Readings */}
        {kanji.name_readings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Name Readings</h3>
            <div className="flex flex-wrap gap-1">
              {kanji.name_readings.map((reading, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                  {reading}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Strokes:</span> {kanji.stroke_count}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Grade:</span> {kanji.grade}
          </div>
          <div>
            <span className="font-semibold text-gray-700">JLPT Level:</span> {kanji.jlpt_level}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Frequency:</span> {kanji.freq_mainichi_shinbun}
          </div>
        </div>

        {/* Notes */}
        {kanji.notes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Notes</h3>
            <ul className="list-disc list-inside text-gray-600">
              {kanji.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kanji;
