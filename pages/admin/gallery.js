'use client';

import { getSession } from 'next-auth/react';
import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { PrismaClient } from '@prisma/client';
import { BsTrash3Fill } from "react-icons/bs";
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

    const images = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);
        
        const photoRecord = await prisma.tamu.findFirst({
          where: { fotoSelfi: `http://tamu.darsya.com/api/file/${filename}` },
          select: { 
            id: true, 
            nama: true,
            noKontak: true,
            asal: true,
            jenisKunjungan: true
          }
        });

        return {
          filename,
          size: stats.size,
          time: stats.mtime.toISOString(),
          url: `/api/file/${filename}`,
          linkedProfile: photoRecord || null
        };
      })
    );

    return {
      props: {
        images,
        error: null
      },
    };
  } catch (error) {
    console.error('Error reading directory:', error);
    return {
      props: {
        images: [],
        error: error.message
      },
    };
  }
}

export default function GalleryPage({ images, error }) {
	function ImageButton({ image }) {
		const [isHovered, setIsHovered] = useState(false);
	
		return (
      <>
        <a
          href={`/tamu/${image.linkedProfile}`}
          className={image.linkedProfile ? "text-red-500 hover:text-red-700" : "text-blue-500 hover:text-blue-700"}
          title="Linked to database record"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {image.linkedProfile && (isHovered ? <PiLinkBreakBold /> : <PiLinkBold />)}
          {!image.linkedProfile && (isHovered ? <PiLinkBold /> : <PiLinkBreakBold />)}
        </a>
        { !image.linkedProfile && (
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
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Image Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          </div>
        </div>
      )}
    </div>
  );
}