import admin from "firebase-admin";
import getRandomFileName from "../helpers/filename.helper.js";
import { Buffer } from "node:buffer";
import urlParse from 'url-parse';

/** Normalize env bucket value: accept `gs://name` or bare name. */
function bucketName() {
  const raw = process.env.BUCKET_URL || process.env.BUCKET_NAME || '';
  return String(raw).replace(/^gs:\/\//, '').replace(/\/$/, '');
}

function storageBucket() {
  const name = bucketName();
  if (!name) {
    throw new Error('BUCKET_URL / BUCKET_NAME is not configured');
  }
  return admin.storage().bucket(name);
}

function publicLink(fullPath) {
  const name = bucketName();
  const base =
    process.env.BUCKET_PATH_URL || 'https://storage.googleapis.com';
  return `${base}/${name}/${fullPath}`;
}

async function signReadUrl(bucketFile) {
  // v4 signed URLs are capped at 7 days; profile/card assets need long-lived URLs in Mongo.
  const [url] = await bucketFile.getSignedUrl({
    action: 'read',
    expires: '01-01-2099',
  });
  return url;
}

async function uploadFile(file, directory, fileName) {
  if (file == undefined) {
    return;
  }
  const bucket = storageBucket();
  const fullPath = `${directory}/${fileName}${extension(file)}`;
  const bucketFile = bucket.file(fullPath);

  await bucketFile.save(file.buffer, {
    contentType: file?.mimetype || 'application/octet-stream',
    resumable: false,
    // Avoid contentEncoding:gzip — clients/apps have had decode issues with it
    gzip: false,
  });
  const url = await signReadUrl(bucketFile);

  return {
    key: fullPath,
    fileName: `${fileName}${extension(file)}`,
    contentType: file?.mimetype,
    public: url,
    link: publicLink(fullPath),
  };
}

async function uploadSingleDocumentFile(file, directory, fileName) {
  if (file == undefined) {
    return;
  }
  const bucket = storageBucket();
  const fullPath = `${directory}/${fileName}${extension(file)}`;
  const bucketFile = bucket.file(fullPath);

  await bucketFile.save(file.buffer, {
    contentType: file?.mimetype || 'application/octet-stream',
    resumable: false,
    gzip: false,
  });
  const url = await signReadUrl(bucketFile);

  return {
    key: fullPath,
    fileName: `${fileName}${extension(file)}`,
    contentType: file?.mimetype,
    public: url,
    link: publicLink(fullPath),
  };
}

async function uploadBufferFile(file, directory, fileName, section) {
  const bucket = storageBucket();
  const fullPath = `${directory}/${fileName}$${section == 'document' ? '' : extension(file)}`;
  console.log('fullpath: ' + fullPath);
  console.log(section);
  const imageBuffer = Buffer.from(file?.buffer, "base64");
  const bucketFile = bucket.file(fullPath);
  await bucketFile.save(imageBuffer, {
    contentType: file.mimeType,
    resumable: false,
    gzip: false,
  });
  const url = await signReadUrl(bucketFile);
  console.log(fullPath);
  return {
    key: fullPath,
    fileName: `${fileName}${section == 'document' ? '' : extension(file)}`,
    contentType: file.mimeType,
    public: url,
    link: publicLink(fullPath),
  };
}

async function deleteBufferFile(filePath) {
  const bucket = storageBucket();
  try {
    await bucket.file(filePath).delete();
    console.log(`File "${filePath}" deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting file "${filePath}":`, error);
  }
}

async function uploadBufferFiles(files, directory) {
  const bucket = storageBucket();
  const list = Array.isArray(files) ? files : [];
  const uploadPromises = list.map(async (image, index) => {
    const randomName = getRandomFileName(`${directory}-`);
    const fullPath = `${directory}/${randomName}${index}${extension(image)}`;
    const imageBuffer = Buffer.from(image?.buffer, "base64");
    const bucketFile = bucket.file(fullPath);
    await bucketFile.save(imageBuffer, {
      contentType: image.mimetype,
      resumable: false,
      gzip: false,
    });
    const url = await signReadUrl(bucketFile);
    return {
      key: fullPath,
      fileName: `${randomName}${extension(image)}`,
      contentType: image.mimetype,
      public: url,
      link: publicLink(fullPath),
    };
  });
  return Promise.all(uploadPromises);
}

async function uploadFiles(files, directory, asFunction = false) {
  if (asFunction) return null;
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }
  const bucket = storageBucket();
  try {
    const urls = await Promise.all(
      files.map(async (image, index) => {
        if (!image?.buffer) {
          throw new Error(
            `Missing file buffer for "${image?.originalname || index}" (multer parse failed?)`
          );
        }
        const randomName = getRandomFileName(`${directory}-`);
        const fullPath = `${directory}/${randomName}${index}${extension(image)}`;
        const bucketFile = bucket.file(fullPath);
        await bucketFile.save(image.buffer, {
          contentType: image.mimetype || 'application/octet-stream',
          resumable: false,
          gzip: false,
        });
        const url = await signReadUrl(bucketFile);
        return {
          type: image?.originalname,
          key: fullPath,
          fileName: `${randomName}${extension(image)}`,
          contentType: image.mimetype,
          public: url,
          link: publicLink(fullPath),
        };
      })
    );
    return urls;
  } catch (err) {
    console.error('[uploadFiles] failed:', err);
    throw err;
  }
}

async function deleteFile(key) {
  const bucket = storageBucket();
  const bucketFile = bucket.file(key);
  await bucketFile
    .delete()
    .then(() => {
      console.log(`Successfully deleted file`);
    })
    .catch((err) => {
      console.log(`Failed to remove file, error: ${err}`);
    });
}

async function deleteFileByUrl(fileUrl, section = 'all') {
  try {
    const bucket = storageBucket();
    const parsedUrl = urlParse(fileUrl);
    const filePath = parsedUrl.pathname.slice(1).replace(/%24/g, '').replace(/%2F/g,'/');
    const pathParts = filePath.split('/');
    const secondLastPart = pathParts.slice(pathParts.length - 2, pathParts.length).join('/');
    const part = secondLastPart.split('.');
    const dollarLink = `${part.slice(0,part.length-1).join('.')}$.${part[part.length-1]}`;
    
    await bucket.file(section == 'document'? secondLastPart : dollarLink).delete();
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

const extension = (file) => {
  switch (file.mimetype) {
    case "application/pdf":
      return ".pdf";
    case "image/svg+xml":
      return ".svg";
    case "image/jpeg":
      return ".jpeg";
    case "image/png":
      return ".png";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    default:
      return ".jpeg";
  }
};

export {
  uploadFile,
  uploadBufferFile,
  uploadBufferFiles,
  uploadFiles,
  deleteFile,
  deleteBufferFile,
  deleteFileByUrl,
};
