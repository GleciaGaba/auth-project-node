const jwt = require("jsonwebtoken");
const {
  signupSchema,
  signinSchema,
  acceptCodeSchema,
  acceptFPCodeSchema,
} = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doHashValidation } = require("../utils/hashing");
const { hmacProcess } = require("../utils/hashing");
const { transporter } = require("../middlewares/sendMail");
const express = require("express");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists!" });
    }
    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
    });
    const result = await newUser.save();
    result.password = undefined;
    res.status(201).json({
      success: true,
      message: "Your account has been created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error, value } = signinSchema.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }
    const result = doHashValidation(password, existingUser.password);
    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Email or password does not exists!",
      });
    }
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        //verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "8h",
      }
    );
    res
      .cookie("Authorization", token, {
        expires: new Date(Date.now() + 8 * 360000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({
        success: true,
        message: "You have been logged in successfully",
        token,
      });
  } catch (error) {
    console.log(error);
  }
};

exports.signout = (req, res) => {
  res.clearCookie("Authorization").status(200).json({
    success: true,
    message: "You have been logged out successfully",
  });
};

//ports.sendVerificationCode = async (req, res) => {
//const { email } = req.body;
//try {
//  const existingUser = await User.findOne({ email });
//  if (!existingUser) {
//    return res
//      .status(401)
//      .json({ success: false, message: "User does not exists!" });
//  }
//  if (existingUser.verified) {
//    return res
//      .status(400)
//      .json({ success: false, message: "User already verified!" });
//  }
//  const codeValue = Math.floor(Math.random() * 1000000).toString();
//  let info = await transporter.sendMail({
//    from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
//    to: existingUser.email,
//    subject: "Account Verification Code",
//    html: "<h1>" + codeValue + "</h1>",
//  });
//  if (info.accepted[0] === existingUser.email) {
//    const hashedCodeValue = hmacProcess(
//      codeValue,
//      process.env.HMAC_VERIFICATION_CODE_SECRET
//    );
//    existingUser.verificationCode = hashedCodeValue;
//    existingUser.verificationCodeValidation = Date.now();
//    await existingUser.save();
//    return res.status(200).json({ success: true, message: "Code sent!" });
//  }
//  res.status(400).json({ success: false, message: "Code sent failed!" });
//} catch (error) {
//  console.log(error);
//}
//
//
//ports.verifyVerificationCode = async (req, res) => {
//const { email, providedCode } = req.body;
//try {
//  const { error, value } = acceptCodeSchema.validate({
//    email,
//    providedCode,
//  });
//  if (error) {
//    return res
//      .status(401)
//      .json({ success: false, message: error.details[0].message });
//  }
//  const codeValue = providedCode.toString();
//  const existingUser = await User.findOne({ email }).select(
//    "+verificationCode +verificationCodeValidation"
//  );
//  if (!existingUser) {
//    return res
//      .status(401)
//      .json({ success: false, message: "User does not exists!" });
//  }
//  if (existingUser.verified) {
//    return res
//      .status(400)
//      .json({ success: false, message: "User already verified!" });
//  }
//  if (
//    !existingUser.verificationCode ||
//    !existingUser.verificationCodeValidation
//  ) {
//    return res.status(400).json({
//      success: false,
//      message: "Something is wrong with your code!",
//    });
//  }
//  if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
//    return res
//      .status(400)
//      .json({ success: false, message: "Code has been expired!" });
//  }
//  const hashedCodeValue = hmacProcess(
//    codeValue,
//    process.env.HMAC_VERIFICATION_CODE_SECRET
//  );
//  if (hashedCodeValue === existingUser.verificationCode) {
//    existingUser.verified = true;
//    existingUser.verificationCode = undefined;
//    existingUser.verificationCodeValidation = undefined;
//    await existingUser.save();
//    return res.status(200).json({
//      success: true,
//      message: "Your account has been verified successfully!",
//    });
//  }
//  return res
//    .status(400)
//    .json({ success: false, message: "Code has been expired!" });
//} catch (error) {
//  console.log(error);
//}
//
//ports.changePassword = async (req, res) => {
//const { userId, verified } = req.user;
//const { oldPassword, newPassword } = req.body;
//try {
//  const { error, value } = changePasswordSchema.validate({
//    oldPassword,
//    newPassword,
//  });
//  if (error) {
//    return res
//      .status(401)
//      .json({ success: false, message: error.details[0].message });
//  }
//  if (!verified) {
//    return res
//      .status(401)
//      .json({ success: false, message: "User not verified!" });
//  }
//  const existingUser = await User.findById(userId).select("+password");
//  if (!existingUser) {
//    return res
//      .status(401)
//      .json({ success: false, message: "User does not exists!" });
//  }
//  const result = await doHashValidation(oldPassword, existingUser.password);
//  if (!result) {
//    return res
//      .status(401)
//      .json({ success: false, message: "Invalid credentials!" });
//  }
//  const hashedPassword = await doHash(newPassword, 12);
//  existingUser.password = hashedPassword;
//  await existingUser.save();
//  return res
//    .status(200)
//    .json({ success: true, message: "Password Updated!" });
//} catch (error) {}
//
//ports.sendForgotPasswordCode = async (req, res) => {
//const { email } = req.body;
//try {
//  const existingUser = await User.findOne({ email });
//  if (!existingUser) {
//    return res
//      .status(401)
//      .json({ success: false, message: "User does not exists!" });
//  }
//
//  const codeValue = Math.floor(Math.random() * 1000000).toString();
//  let info = await transporter.sendMail({
//    from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
//    to: existingUser.email,
//    subject: "Forgot password Code",
//    html: "<h1>" + codeValue + "</h1>",
//  });
//  if (info.accepted[0] === existingUser.email) {
//    const hashedCodeValue = hmacProcess(
//      codeValue,
//      process.env.HMAC_VERIFICATION_CODE_SECRET
//    );
//    existingUser.forgotPasswordCode = hashedCodeValue;
//    existingUser.forgotPasswordCodeValidation = Date.now();
//    await existingUser.save();
//    return res.status(200).json({ success: true, message: "Code sent!" });
//  }
//  res.status(400).json({ success: false, message: "Code sent failed!" });
//} catch (error) {
//  console.log(error);
//}
//
//
//ports.verifyForgotPasswordCode = async (req, res) => {
//const { email, providedCode, newPassword } = req.body;
//try {
//  const { error, value } = acceptFPCodeSchema.validate({
//    email,
//    providedCode,
//    newPassword,
//  });
//  if (error) {
//    return res
//      .status(401)
//      .json({ success: false, message: error.details[0].message });
//  }
//  const codeValue = providedCode.toString();
//  const existingUser = await User.findOne({ email }).select(
//    "+forgotPasswordCode +forgotPasswordCodeValidation"
//  );
//  if (!existingUser) {
//    return res
//      .status(401)
//      .json({ success: false, message: "User does not exists!" });
//  }
//
//  if (
//    !existingUser.forgotPasswordCode ||
//    !existingUser.forgotPasswordCodeValidation
//  ) {
//    return res.status(400).json({
//      success: false,
//      message: "Something is wrong with your code!",
//    });
//  }
//  if (
//    Date.now() - existingUser.forgotPasswordCodeValidation >
//    5 * 60 * 1000
//  ) {
//    return res
//      .status(400)
//      .json({ success: false, message: "Code has been expired!" });
//  }
//  const hashedCodeValue = hmacProcess(
//    codeValue,
//    process.env.HMAC_VERIFICATION_CODE_SECRET
//  );
//  if (hashedCodeValue === existingUser.forgotPasswordCode) {
//    const hashedPassword = await doHash(newPassword, 12);
//    existingUser.password = hashedPassword;
//    existingUser.verified = true;
//    existingUser.forgotPasswordCodeCode = undefined;
//    existingUser.forgotPasswordCodeValidation = undefined;
//    await existingUser.save();
//    return res.status(200).json({
//      success: true,
//      message: "Password updated!!",
//    });
//  }
//  return res
//    .status(400)
//    .json({ success: false, message: "Code has been expired!" });
//} catch (error) {
//  console.log(error);
//}
//};
