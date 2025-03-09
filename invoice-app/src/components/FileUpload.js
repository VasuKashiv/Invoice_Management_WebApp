import { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadInvoiceFile, fetchInvoices } from "../redux/slices/invoiceSlice";
import { fetchProducts } from "../redux/slices/productSlice";
import { fetchCustomers } from "../redux/slices/customerSlice";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false); // ✅ Loading state
  const dispatch = useDispatch();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setIsUploading(true); // ✅ Show loading state
    setUploadStatus("");

    try {
      const result = await dispatch(uploadInvoiceFile(file));

      if (result.payload?.message) {
        setUploadStatus("✅ Upload successful! Data extracted.");

        // ✅ Refresh all tabs after successful upload
        dispatch(fetchInvoices());
        dispatch(fetchProducts());
        dispatch(fetchCustomers());
      } else {
        setUploadStatus(
          "❌ Upload failed: " + (result.payload?.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Upload Error:", error);
      setUploadStatus("❌ Upload failed. Please try again.");
    }

    setIsUploading(false); // ✅ Hide loading state
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-md mb-4">
      <h2 className="text-lg font-semibold mb-2">Upload Invoice File</h2>
      <input type="file" onChange={handleFileChange} className="mb-2" />

      <button
        onClick={handleUpload}
        className={`ml-2 px-4 py-2 rounded-md text-white ${
          isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
        }`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      {uploadStatus && (
        <p className="mt-2 text-sm text-gray-700">{uploadStatus}</p>
      )}
    </div>
  );
};

export default FileUpload;
