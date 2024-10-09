const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')

const userModel = require('../models/userModel')
const createToken = require('../utils/createToken')



exports.getUser = asyncHandler(async(req,res)=>{
  const me = await userModel.findById(req.params.id)
  res.status(200).json({data:me})
})

//@desc Get Logged user
//@route GET api/users/getMe

exports.getLoggedUser=asyncHandler(async(req,res,next)=>{
  req.params.id = req.user._id
  next()
})



// @desc    Update logged user password
// @route   PUT /api/users/changeMyPassword

exports.updateLoggedUserPassword=asyncHandler(async(req,res,next)=>{
  // 1) Update user password based user payload (req.user._id)
  const user =await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password:await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {new:true},
)
// 2) Generate token
const token = createToken(user._id)

res.status(200).json({data:user,token})

})



// @desc    Update logged user Date {waithout password , role }
// @route   PUT /api/users/updateMe
// @access  Private/auth
exports.updateLoggedUserData=asyncHandler(async(req,res,next)=>{
  const updatedUser =await userModel.findByIdAndUpdate(req.user._id,{
    name:req.body.name,
    email:req.body.email,
  },
  {new:true})

  res.status(200).json({data:updatedUser})
})

