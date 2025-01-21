import React, { useState, useCallback } from "react";
import { FiUpload, FiAlertCircle } from "react-icons/fi";
import { MdClose } from "react-icons/md";

const AIImageProcessor = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState([]);

  const onFileChange = (event) => {
    setError("");
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    try {
      const formdata = new FormData();
      formdata.append("image", file); 
      const response = await fetch("http://127.0.0.1:5000/api/upload", {
        method: "POST",
        body: formdata,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setIsProcessing(false);

      // console.log(data);

      setProcessedResults(data.processedResults); 
      setIsProcessing(false);
    } catch (err) {
      setError("Error processing image. Please try again.");
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setProcessedResults([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
            Skin Image Detection Model
          </h1>
          <p className="text-xl text-purple-200">
            Upload an image and let our AI detect, segment and classify the disease
          </p>
        </header>

        <div className="backdrop-blur-lg bg-white/10 rounded-xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:bg-purple-900/20">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="w-full p-4 text-purple-200 bg-transparent border-2 border-purple-400 rounded-xl"
                  aria-label="Upload image"
                />
                <div className="text-center mt-4">
                  <FiUpload className="mx-auto h-16 w-16 text-purple-300" />
                  <p className="mt-4 text-lg text-purple-200">
                    Click to select an image
                  </p>
                </div>
              </div>
            </div>

            {uploadedImage && (
              <div className="relative group">
                <img
                  src={uploadedImage}
                  alt="Original uploaded image"
                  className="w-full h-80 object-fit rounded-lg shadow-xl transition-transform group-hover:scale-[1.02]"
                  onError={() => setError("Error loading image")}
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 p-2 bg-black/50 rounded-full shadow-lg hover:bg-black/70 transition-colors"
                  aria-label="Clear image"
                >
                  <MdClose className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center text-red-200">
              <FiAlertCircle className="w-6 h-6 mr-3" />
              {error}
            </div>
          )}
        </div>

        {isProcessing ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-6 text-xl text-purple-200">Processing your image...</p>
          </div>
        ) : (
          processedResults.length > 0 && (
            <div className="backdrop-blur-lg bg-white/10 rounded-xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8">
                Processing Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {processedResults.map((result, index) => (
                  <div
                    key={index}
                    className="relative group overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <img
                      src={`data:image/png;base64,${result}`} // Adjust based on backend response structure
                      alt={`AI processed result ${index + 1}`}
                      className="w-full h-64 object-fit"
                      onError={(e) => {
                        e.target.src = "fallback-image-url";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
                      <p className="text-white text-lg font-medium">
                        {
                          (index!==2)?((index===0) ?"Segementation Result":"Detection Result"):"Classification Result"
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AIImageProcessor;
