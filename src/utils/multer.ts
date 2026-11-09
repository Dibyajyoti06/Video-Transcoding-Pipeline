import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload-s3')
  },
  filename: function (req, file, cb) {
    const uniqueName = crypto.randomUUID();
    const extension = path.extname(file.originalname);

    cb(null, `${uniqueName}${extension}`);
  }
})

const upload = multer({ storage: storage })

export default upload;