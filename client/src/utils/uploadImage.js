const uploadImage = async (file) => {
    const cloudName = "di7szg6ub";
    const uploadPreset = "campuslostandfound";

    console.log("Cloud name:", cloudName);
    console.log("Preset:", uploadPreset);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
    );
    const data = await res.json();
    console.log("Cloudinary response:", data);
    return data.secure_url;
};

export default uploadImage;