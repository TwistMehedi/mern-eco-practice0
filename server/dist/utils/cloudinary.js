import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: 'duh8jscx3',
    api_key: '523382213293998',
    api_secret: 'XUDkTK-kAMj2JeHqLrBxIHPLHbA' // Click 'View API Keys' above to copy your API secret
});
export const uploadImage = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            resource_type: 'auto', // Automatically detect the resource type
        });
        return {
            secure_url: result.secure_url,
        };
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};
export const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: 'auto', // Automatically detect the resource type
        });
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
};
