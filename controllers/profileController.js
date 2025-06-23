const { generateRandomString } = require("../utils");

const allowedFields = [
  "profile_image",
  "bio",
  "job_title",
  "company",
  "location",

  "gender",
  "relationship_status",

  "education",
];
exports.fillProfile = async (req, res) => {
  var statusCode = -1;
  try {
    const body = req.body;
    const userId = req.body.user_id;

    const usersModel = req.app.locals.models.users;
    const validationResult = await validateRequest(body, userId, usersModel);

    if (validationResult.statusCode !== -1) {
      statusCode = validationResult.statusCode;
      throw validationResult.error;
    }
    const profileModel = req.app.locals.models.usersProfile;
    const isProfileExist = await profileModel.isProfileExist(userId);

    if (isProfileExist) {
      statusCode = 400;
      throw "profile details has been filled for this user. if you want to update theme, use '/profile/update' endpoint";
    }
    const profileDetails = {
      user_id: userId,
    };
    const profileId = generateRandomString();
    allowedFields.forEach((field) => {
      profileDetails[field] = req.body[field] ? req.body[field] : "";
    });
    const result = await profileModel.create(profileDetails, profileId);
    if (result.insertedCount) {
      return res.status(200).json({
        success: true,
        profile: { profile_id: profileId, ...profileDetails },
      });
    } else {
      statusCode = 500;
      throw "server error";
    }
  } catch (err) {
    if (statusCode === -1) {
      statusCode = 500;
    }
    return res.status(statusCode).json({ success: false, error_msg: err });
  }
};

exports.updateProfile = async (req, res) => {
  let statusCode = -1;
  let error_msg = "server error";
  try {
    const body = req.body;
    const userId = body.user_id;
    delete body.user_id;
    const usersModel = req.app.locals.models.users;
    const validationResult = validateRequest(body, userId, usersModel);
    if (validationResult.statusCode === -1) {
      statusCode = validationResult.statusCode;
      error_msg = validationResult.error;
      throw error_msg;
    }
    const profileModel = req.app.locals.models.usersProfile;
    const updateResult = await profileModel.updateProfile(userId, body);
    if (updateResult.matchedCount === 0) {
      statusCode = 404;
      error_msg = "Profile not found";
      throw error_msg;
    }

    return res.status(200).json({ success: true, profile: body });
  } catch (error) {
    console.log(error);

    return res.status(statusCode !== -1 ? statusCode : 500).json({
      success: false,
      error: error_msg,
    });
  }
};
exports.getProfile = async (req, res) => {
  let statusCode = -1;
  try {
    const userId = req.params.user_id;
    if (!userId) {
      statusCode = 400;
      throw "user_id query param is missing";
    }
    const profileModel = req.app.locals.models.usersProfile;
    const usersModel = req.app.locals.models.users;
    const user = await usersModel.findByCustomId(userId);
    if (!user) {
      statusCode = 404;
      throw "user not found";
    }
    const profile = await profileModel.findByUserId(userId);
    console.log(profile);
    if (!profile) {
      statusCode = 404;
      throw "user profile is not exist";
    }
    const result = Object.assign(user, profile);
    return res.status(200).json({ success: true, user: result });
  } catch (error) {
    statusCode = statusCode === -1 ? 500 : statusCode;
    return res.status(statusCode).json({ success: false, error_msg: error });
  }
};

async function validateRequest(body, userId, usersModel) {
  const result = {
    statusCode: -1,
    error: "",
  };
  try {
    // Validate body
    if (!body || Object.keys(body).length === 0) {
      result.statusCode = 400;
      result.error = "Request body is empty";
    }
    if (!userId) {
      result.statusCode = 400;
      result.error = "user_id is required in URL";
    }

    // Validate allowed fields only
    const bodyKeys = Object.keys(body);
    const hasInvalidFields = bodyKeys.some(
      (key) => !allowedFields.includes(key) && key !== "user_id"
    );
    if (hasInvalidFields) {
      result.statusCode = 400;
      result.error = `Only allowed fields: ${allowedFields.join(", ")}`;
    }
    const user = await usersModel.findByCustomId(userId);
    if (!user) {
      result.statusCode = 404;
      result.error = "User not found";
    }
    return result;
  } catch (err) {
    result.statusCode = 500;
    result.error = "server error";
    return result;
  }
}
