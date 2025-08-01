import { useState, useRef } from "react";
import type { KanjiData } from "../Kanji/Kanji";

interface CameraProps {
  onKanjiDetected: (kanji: KanjiData) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

const Camera: React.FC<CameraProps> = ({ onKanjiDetected, onError, onLoading }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = "https://kanji-api-09daa91fbd9b.herokuapp.com/api/v1";

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      console.log('User agent:', navigator.userAgent);
      console.log('HTTPS:', window.location.protocol === 'https:');

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onError("Camera not supported in this browser. Please use file upload instead.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('Camera stream obtained:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
        console.log('Camera opened successfully');
      }
    } catch (err) {
      console.error('Camera error:', err);

      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          onError("Camera access denied. Please allow camera permissions in your browser settings or use file upload.");
        } else if (err.name === 'NotFoundError') {
          onError("No camera found. Please use file upload instead.");
        } else if (err.name === 'NotSupportedError') {
          onError("Camera not supported. Please use file upload instead.");
        } else if (err.name === 'NotReadableError') {
          onError("Camera is in use by another application. Please close other camera apps or use file upload.");
        } else if (err.name === 'OverconstrainedError') {
          onError("Camera doesn't support the requested settings. Please use file upload.");
        } else {
          onError(`Camera error: ${err.message}. Please use file upload instead.`);
        }
      } else {
        onError("Camera access failed. Please use file upload instead.");
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    onLoading(true);
    onError("");

    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', blob, 'kanji.jpg');

      // Send to OCR endpoint
      const ocrResponse = await fetch(`${API_BASE_URL}/ocr`, {
        method: 'POST',
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error(`OCR failed: ${ocrResponse.status}`);
      }

      const ocrData = await ocrResponse.json();
      console.log('Full OCR Response:', ocrData);
      console.log('OCR Response type:', typeof ocrData);
      console.log('OCR Response keys:', Object.keys(ocrData));
      console.log('ocrData.kanji:', ocrData.kanji);
      console.log('ocrData.kanji type:', typeof ocrData.kanji);
      console.log('ocrData.character:', ocrData.character);
      console.log('ocrData.id:', ocrData.id);

      // Handle different possible response formats
      let detectedKanji = null;

      // Format 1: { kanji: "火" } - Your API format
      if (ocrData.kanji && typeof ocrData.kanji === 'string') {
        detectedKanji = ocrData.kanji;
        console.log('Detected kanji from string:', detectedKanji);
      }
      // Format 2: { kanji: ["家"] } - Array format
      else if (ocrData.kanji && Array.isArray(ocrData.kanji) && ocrData.kanji.length > 0) {
        detectedKanji = ocrData.kanji[0];
        console.log('Detected kanji from array:', detectedKanji);
      }
      // Format 3: { character: "家" }
      else if (ocrData.character) {
        detectedKanji = ocrData.character;
        console.log('Detected kanji from character field:', detectedKanji);
      }
      // Format 4: Direct kanji data object (your API format)
      else if (ocrData.kanji && ocrData.kanji.id && ocrData.kanji.character) {
        console.log('OCR returned full kanji data directly');
        onKanjiDetected(ocrData.kanji);
        setCapturedImage(null);
        return;
      }
      // Format 5: Array of kanji objects
      else if (Array.isArray(ocrData) && ocrData.length > 0 && ocrData[0].character) {
        console.log('OCR returned array of kanji objects');
        onKanjiDetected(ocrData[0]);
        setCapturedImage(null);
        return;
      }

      if (detectedKanji) {
        console.log('Looking up kanji details for:', detectedKanji);
        // Fetch detailed kanji information
        const kanjiResponse = await fetch(`${API_BASE_URL}/kanjis?character=${encodeURIComponent(detectedKanji)}`);

        if (kanjiResponse.ok) {
          const kanjiData = await kanjiResponse.json();
          console.log('Kanji lookup response:', kanjiData);
          if (kanjiData && kanjiData.length > 0) {
            onKanjiDetected(kanjiData[0]);
            setCapturedImage(null);
            return;
          }
        } else {
          console.error('Kanji lookup failed:', kanjiResponse.status);
          onError(`Failed to get kanji details: ${kanjiResponse.status}`);
          return;
        }
      }

      onError("No kanji detected in the image. Please try again with a clearer image.");
    } catch (err) {
      console.error('OCR processing error:', err);
      onError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setIsProcessing(false);
      onLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      {/* Camera Controls */}
      {!isCameraOpen && !capturedImage && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={startCamera}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Open Camera
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Image
            </button>
          </div>

          {/* Mobile-specific tips */}
          <div className="text-center text-sm text-gray-500">
            <p>📱 <strong>Mobile Tip:</strong> If camera doesn't work, try the "Upload Image" option!</p>
            {window.location.protocol === 'http:' && (
              <p className="text-orange-600 mt-1">⚠️ Camera requires HTTPS. Use file upload for now.</p>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera View */}
      {isCameraOpen && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg shadow-lg"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={captureImage}
              className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-semibold"
            >
              📸 Capture
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Captured Image */}
      {capturedImage && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured kanji"
              className="w-full rounded-lg shadow-lg"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={retakePhoto}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold"
              >
                🔄 Retake
              </button>
              <button
                onClick={() => setCapturedImage(null)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-semibold"
              >
                ❌ Cancel
              </button>
            </div>
          </div>

          <button
            onClick={() => processImage(capturedImage)}
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                🔍 Scan for Kanji
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Camera;
