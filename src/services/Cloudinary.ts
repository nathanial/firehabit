import * as cloudinary from 'cloudinary-core';
const cloudName = 'dsv1fug8x';
const unsignedUploadPreset = 'fnddxf5w';
const cl = new cloudinary.Cloudinary({cloud_name: cloudName, secure: true});

export async function uploadFile(file: File): Promise<Attachment> => {
    return new Promise<Attachment>((resolve) => {
        var url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
        var xhr = new XMLHttpRequest();
        var fd = new FormData();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        // Update progress (can be used to show progress indicator)
        xhr.upload.addEventListener("progress", (e) => {
            var progress = Math.round((e.loaded * 100.0) / e.total);
            this.setState({
                uploading: true,
                progress: progress
            });
            // console.log(`fileuploadprogress data.loaded: ${e.loaded}, data.total: ${e.total}`);
        });

        xhr.onreadystatechange = (e) => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // File uploaded successfully
                var response = JSON.parse(xhr.responseText);
                // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
                const attachment = _.cloneDeep(response);
                attachment.name = response.original_filename;
                console.log("Attachment", attachment);
                this.setState({
                    uploading: false
                });
                resolve(attachment);
            }
        };

        fd.append('upload_preset', unsignedUploadPreset);
        fd.append('tags', 'browser_upload'); // Optional - add tag for image admin in Cloudinary
        fd.append('file', file);
        xhr.send(fd);
    });
}
