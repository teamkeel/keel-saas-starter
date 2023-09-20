import { models, permissions, UploadImageToCloudinary } from '@teamkeel/sdk';
import { v2 as cloudinary } from 'cloudinary';

export default UploadImageToCloudinary(async (ctx, input) => {
  cloudinary.config({
    cloud_name: ctx.secrets.CLOUD_NAME,
    api_key: ctx.secrets.API_KEY,
    api_secret: ctx.secrets.API_SECRET,
  });

  try {
    const uploadResponse = await cloudinary.uploader.upload(input.base64Image, {
      upload_preset: ctx.secrets.UPLOAD_PRESET,
    });

    const imagePath = uploadResponse.secure_url;

    // Check if ctx.identity or ctx.identity.id is undefined, grant or deny permission if identity is available or unavailable respectively
    if (!ctx.identity || !ctx.identity.id) {
      throw new Error('No authenticated identity found') && permissions.deny();
    } else {
      permissions.allow();
    }

    // safely fetch the user
    const user = await models.user.findOne({
      id: input.userId,
    });

    // if a teamId is provided instead, pull the team image too
    if (input.teamId) {
      const team = await models.team.findOne({
        id: input.teamId,
      });
    }

    // Check if user is null
    if (!user) {
      throw new Error('User not found in database');
    }

    // Save this imagePath to Keel database
    const imageRecord = await models.profileImage.create({
      path: imagePath,
      userId: input.userId,
      teamId: input.teamId || null,
    });

    return {
      path: imageRecord.path,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
});
