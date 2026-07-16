const axios = require("axios");
const config = require("../config/config");

const GROUPME_IMAGE_UPLOAD_URL =
  "https://image.groupme.com/pictures";

async function uploadImageToGroupMe(imageUrl, contentType) {
  if (!config.groupme.accessToken) {
    throw new Error(
      "GROUPME_ACCESS_TOKEN is required to upload images."
    );
  }

  // Download the image from Discord.
  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    maxContentLength: 25 * 1024 * 1024,
    maxBodyLength: 25 * 1024 * 1024,
  });

  const resolvedContentType =
    contentType ||
    imageResponse.headers["content-type"] ||
    "image/jpeg";

  // Upload the raw image bytes to GroupMe's image service.
  const uploadResponse = await axios.post(
    GROUPME_IMAGE_UPLOAD_URL,
    imageResponse.data,
    {
      headers: {
        "X-Access-Token": config.groupme.accessToken,
        "Content-Type": resolvedContentType,
      },
      maxContentLength: 25 * 1024 * 1024,
      maxBodyLength: 25 * 1024 * 1024,
    }
  );

  const groupMeImageUrl =
    uploadResponse.data?.payload?.picture_url;

  if (!groupMeImageUrl) {
    throw new Error(
      "GroupMe did not return an uploaded image URL."
    );
  }

  return groupMeImageUrl;
}

module.exports = uploadImageToGroupMe;