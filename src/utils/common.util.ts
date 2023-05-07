import { diskStorage } from 'multer';
import path from 'path';

export const storageUploadHandle = () => ({
  storage: diskStorage({
    destination: './public/profile-images',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') +
        Date.now() +
        Math.round(Math.random() * 1e9);
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
});
