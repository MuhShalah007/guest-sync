'use client';

import { getSession } from 'next-auth/react';
import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { PrismaClient } from '@prisma/client';
import { BsTrash3Fill } from "react-icons/bs";
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiDownload, FiUploadCloud } from 'react-icons/fi';
import { PiLinkBold, PiLinkBreakBold } from "react-icons/pi";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { req, res } = context;
  const session = await getSession(context);
  if (!session) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        error_code: 401,
        description: "Unauthorized",
      })
    );
    return { props: {} };
  }

  const uploadsDir = path.join(process.cwd(), 'public/uploads');
  try {
    const imageFiles = await fs.readdir(uploadsDir);
    
    const guests = await prisma.tamu.findMany({
      select: {
        id: true,
        nama: true,
        noKontak: true,
        asal: true,
        jenisKunjungan: true,
        fotoSelfi: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const images = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);
        
        const photoUrl = `http://tamu.darsya.com/api/file/${filename}`;
        const linkedGuest = guests.find(guest => guest.fotoSelfi === photoUrl);

        return {
          filename,
          size: stats.size,
          time: stats.mtime.toISOString(),
          url: `/api/file/${filename}`,
          linkedProfile: linkedGuest || null
        };
      })
    ).then(images => 
      images.sort((a, b) => new Date(b.time) - new Date(a.time))
    );

    return {
      props: {
        images,
        guests,
        error: null
      },
    };
  } catch (error) {
    console.error('Error reading directory:', error);
    return {
      props: {
        images: [],
        guests: [],
        error: error.message
      },
    };
  }
}

export default function GalleryPage({ images, guests: initialGuests, error }) {
  const [guests, setGuests] = useState(initialGuests);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredGuests = guests.filter(guest => 
    guest.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.asal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLinkClick = async (guest) => {
    if (!selectedImage) return;
    if (confirm(`Are you sure you want to link this image to ${guest.nama}${guest.fotoSelfi ? '\nWarning: This will replace the existing photo!' : ''}?`)) {
      try {
        const response = await fetch(`/api/tamu?id=${guest.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fotoSelfi: `http://tamu.darsya.com/api/file/${selectedImage.filename}`
          })
        });

        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'Failed to update');
        }

        // Update local state
        const updatedImage = { ...selectedImage, linkedProfile: guest };
        setGalleryImages(prev => 
          prev.map(img => img.filename === selectedImage.filename ? updatedImage : img)
        );
        setIsSelectOpen(false);
        setSelectedGuest(null);
        setSearchTerm('');
      } catch (error) {
        console.error('Error linking image:', error);
        alert(error.message || 'Failed to link image to guest');
      }
    }
  };
  function ImageButton({ image }) {
    const [isHovered, setIsHovered] = useState(false);
  
    return (
      <>
        <div className="relative">
          {image.linkedProfile ? (
            <a
              href={`/tamu/${image.linkedProfile.id}`}
              className="text-red-500 hover:text-red-700"
              title="Linked to database record"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isHovered ? <PiLinkBreakBold /> : <PiLinkBold />}
            </a>
          ) : (
            <button
              onClick={() => { setIsSelectOpen(true); setSelectedImage(image);} }
              className="text-blue-500 hover:text-blue-700"
              title="Link to guest"
            >
              <PiLinkBreakBold />
            </button>
          )}
  
          {isHovered && image.linkedProfile && (
            <div className="absolute top-6 right-0 w-48 p-2 rounded shadow-lg bg-gradient-to-b from-black/80 to-transparent text-white text-sm z-10">
              <p>Name: {image.linkedProfile.nama}</p>
              <p>Contact: {image.linkedProfile.noKontak}</p>
              <p>Origin: {image.linkedProfile.asal}</p>
              <p>Visit Type: {image.linkedProfile.jenisKunjungan}</p>
            </div>
          )}
        </div>
        {!image.linkedProfile && (
          <button
            onClick={() => handleDelete(image.filename)}
            className="text-red-500 hover:text-red-700"
            title="Delete image"
          >
            <BsTrash3Fill />
          </button>
        )}
      </>
    );
	}
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState(images);
	const [isHovered, setIsHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setUploadProgress(0);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('keepOriginalName', 'true');

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        if (data.ok) {
          // Add the new image to the gallery
          const newImage = {
            filename: data.result.split('/').pop(),
            url: data.result,
            size: file.size,
            time: new Date().toISOString(),
            linkedProfile: null
          };
          setGalleryImages(prev => [newImage, ...prev]);
        }
        setUploadProgress(prev => prev + (100 / acceptedFiles.length));
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image');
      }
    }
    
    setUploading(false);
    setUploadProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleDelete = async (filename) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        await fetch(`/api/delete-file/${filename}`, {
          method: 'DELETE',
        });
        setGalleryImages(galleryImages.filter(img => img.filename !== filename));
        if (selectedImage?.filename === filename) {
          setSelectedImage(null);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
        alert('Failed to delete file');
      }
    }
  };
  // Add new state for import progress
  const [importProgress, setImportProgress] = useState({ total: 0, current: 0, status: '' });
  
  const handleImportImages = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.zip')) {
      alert('Please select a zip file');
      return;
    }

    const formData = new FormData();
    formData.append('zipFile', file, file.name); // Add filename explicitly

    try {
      setUploading(true);
      setImportProgress({ total: 0, current: 0, status: 'Reading zip file...' });
  
      const response = await fetch('/api/import-images', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Import failed');
      }

      // Then start monitoring progress
      const eventSource = new EventSource('/api/import-progress');
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setImportProgress(data);
        
        if (data.status === 'completed') {
          eventSource.close();
          setUploading(false);
          window.location.reload();
        } else if (data.status === 'error') {
          eventSource.close();
          setUploading(false);
          alert('Import failed');
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setUploading(false);
        setImportProgress({ total: 0, current: 0, status: '' });
      };

    } catch (error) {
      console.error('Import error:', error);
      alert(error.message || 'Failed to import images');
      setUploading(false);
      setImportProgress({ total: 0, current: 0, status: '' });
    }
  };
  
  // Add this in the JSX where the upload progress bar is
  {uploading && (
    <div className="mb-8">
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ 
            width: importProgress.total ? 
              `${Math.round((importProgress.current / importProgress.total) * 100)}%` : 
              '0%'
          }}
        />
      </div>
      <p className="text-center mt-2 text-sm text-gray-600">
        {importProgress.status}<br />
        {importProgress.total > 0 && 
          `Processing: ${importProgress.current} of ${importProgress.total} files (${Math.round((importProgress.current / importProgress.total) * 100)}%)`
        }
      </p>
    </div>
  )}
  const handleExportImages = async () => {
    try {
      const response = await fetch('/api/download-images', {
        method: 'GET',
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `gallery-export-${date}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export images');
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-1">
          Image Gallery
          <span className="text-lg font-normal text-gray-500 ml-2">
            ({galleryImages.length} images)
          </span>
        </h1>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
            <FiUploadCloud className="text-lg" />
            Import ZIP
            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleImportImages}
            />
          </label>
          <button
            onClick={handleExportImages}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FiDownload className="text-lg" />
            Export Images
          </button>
        </div>
      </div>
      <div
        {...getRootProps()} 
        className={`
          mb-8 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto text-4xl mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-500">Drop the images here ...</p>
        ) : (
          <p className="text-gray-500">
            Drag 'n' drop some images here, or click to select files
          </p>
        )}
      </div>

      {uploading && (
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-center mt-2 text-sm text-gray-600">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative">
        {galleryImages.map((image, index) => (
          <div
            key={image.filename}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
          >
            <div 
              className="relative h-64 w-full cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <Image
                src={image.url}
                alt={image.filename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 truncate">{image.filename}</p>
              <p className="text-sm text-gray-500">
                Size: {formatBytes(image.size)}
              </p>
              <p className="text-sm text-gray-500">
                Modified: {formatDateTime(image.time)}
              </p>
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
							<ImageButton key={index} image={image} />
            </div>
          </div>
        ))}
      </div>
      {galleryImages.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No images found in the uploads folder
        </p>
      )}
      {error && (
        <p className="text-center text-gray-500 mt-8">
          {error}
        </p>
      )}

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={closeModal}
            >
              ✕
            </button>
            <div className="relative">
              <Image
                src={selectedImage.url}
                alt={selectedImage.filename}
                width={0}
                height={0}
                sizes="100vw"
                className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
                unoptimized
              />
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">{selectedImage.filename}</p>
              <p className="text-sm text-gray-500">
                Size: {formatBytes(selectedImage.size)}
              </p>
              <p className="text-sm text-gray-500">
                Modified: {formatDateTime(selectedImage.time)}
              </p>
            </div>

            {isSelectOpen && !selectedImage.linkedProfile && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white/90 backdrop-blur-sm w-96 rounded-lg shadow-lg overflow-hidden border border-gray-200/50">
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-700">Link to Guest</h3>
                      <button
                        onClick={() => setIsSelectOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search guest..."
                      className="w-full px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {filteredGuests.map(guest => (
                      <button
                        key={guest.id}
                        className="w-full text-left p-3 rounded-lg hover:bg-white/80 transition-colors duration-200 space-y-1"
                        onClick={() => handleLinkClick(guest)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{guest.nama}</span>
                          {guest.fotoSelfi && (
                            <span className="text-xs text-orange-500 font-medium">Has Photo</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 space-y-0.5">
                          {guest.asal && (
                            <p className="flex items-center gap-1">
                              <span>From:</span>
                              <span className="font-medium">{guest.asal}</span>
                            </p>
                          )}
                          {guest.jenisKunjungan && (
                            <p className="flex items-center gap-1">
                              <span>Visit:</span>
                              <span className="font-medium">{guest.jenisKunjungan}</span>
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredGuests.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No guests found</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
GalleryPage.auth = {
  role: "ADMIN",
  loading: (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard</h2>
        <p className="text-gray-500">Please wait a moment...</p>
      </div>
    </div>
  ),
  unauthorized: "/admin/login",
}
