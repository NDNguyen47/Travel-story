import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    if (!imageFile) {
        throw new Error("Image file is required");
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await axiosInstance.post("/image-upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading the image", error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

export default uploadImage;