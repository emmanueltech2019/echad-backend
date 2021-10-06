const User = require('../models/user.model')
const Savings = require('../models/savings.model')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const {SALT,APP_SECRET}=require('../config')

exports.register=(req,res)=>{
    const {email,password,fullname}=req.body


    User.findOne({email},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:'an error occured'
            })
        }
        if(user){
            return res.status(400).json({
                message:'email already exist'
            })
        }
        if(!user){
            const salt = bcrypt.genSaltSync(parseInt(SALT));
            const hash = bcrypt.hashSync(password, salt);
            

            let newUser = new User({
                password:hash,
                fullname,
                email
            })

       
            newUser.save()
            .then((resp)=>{
              let token = jwt.sign(
                {
                  // exp: Math.floor  (Date.now() / 1000) + 60 * 60,
                  data: { id: resp._id},
                },
                APP_SECRET
              );
                res.status(201).json({
                    message:'account created successfully',
                    token
                })
            })
            .catch(()=>{
                res.status(500).json({
                    message:'unknown error occured during account creation'
                })
            })
        }
    })
}


exports.login=(req,res)=>{
    const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured ",
      });
    }
    if (!user) {
      return res.status(404).json({
        message: "account does not exist",
      });
    }
    if (user) {
      let isPasswordValid = bcrypt.compareSync(password, user.password);
      if (isPasswordValid) {
        let token = jwt.sign(
          {
            // exp: Math.floor  (Date.now() / 1000) + 60 * 60,
            data: { id: user._id},
          },
          APP_SECRET
        );
        res.status(200).json({
          token,
          message: "login successful",
          user: {
            _id: user._id,
            fullname: user.fullname,
            uptodate:user.uptodate
          },
        });
      } else {
        res.status(400).json({
          message: "invalid password",
        });
      }
    }
  });
}

exports.updateAccount=(req,res)=>{

    const {id}=req.user.data
    const {phone,occupation,address,
        city,busstop,state,nationality,
        stateoforigin,nextofkinname,
        nextofkinphone,bankname,accountname,
        accountnumber,manager}=req.body

    User.findOneAndUpdate({_id:id},
        {phone,occupation,address,
        city,busstop,state,nationality,
        stateoforigin,nextofkinname,
        nextofkinphone,uptodate:true,
        bankname,accountname,accountnumber,manager},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:'an error occured'
            })
        }
        if(user){
            res.status(200).json({
                message:'successfully updated'
            })
        }
    })
}

exports.profileDetails=(req,res)=>{
    const {id}=req.user.data
    User.findOne({_id:id},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured"
            })
        }
        if(user){
            return res.status(200).json({
                message:'success',
                user
            })
        }
    })
}



exports.newSaving=(req,res)=>{
  let {name,amount,purpose}=req.body
  let id=req.user.data.id
  Savings.findOne({user:id},(err,savings)=>{
    if(err){
      return res.status(400).json({
        message:'an error occured'
      })
    }
    if(!savings){
        let newSavings = new Savings({user:req.user.data.id});
        newSavings.savings.push({name,amount,purpose})

        newSavings.save((error, save) => {
          if (error) return res.send(error);
          res.send(save);
        });
    }
    if(savings){
      savings.savings.push({name,amount,purpose})
      savings.save((error, save) => {
        if (error) return res.send(error);
        res.send(save);
      });
    }
  })
}

exports.getuserssavings=(req,res)=>{
  Savings.findOne({user:req.user.data.id},(err,savings)=>{
    if(err){
      return res.status(400).json({
        message:'an error occured'
      })
    }
    if(!savings){
      return res.status(200).json({
        message:'list is empty',
        savings:[]
      })
    }
    if(savings){
      return res.status(200).json({
        message:'list is empty',
        savings:savings.savings
      })
    }
  })
}

exports.makepaymenttransfer=(req,res)=>{
  User.findOne({_id:req.user.data.id},(err,user)=>{
    if(err){
      return res.status(400).json({message:'an error occured'})
    }
    if(user){
      let {planid,amount}=req.body
      user.transfers.push({
        amount,
        planid,
        date:new Date(),
        file:req.file.path,
        email:user.email,
        approved:false,
        state:'pending'
      })
      user.paymentRequest=true
      user.startedSaving=true
      user.save()
      .then(()=>{
        return res.status(200).json({
          message:'payment request recieved successfully'
        })
      })
    }
  })
}


exports.withdrawSavings=(req,res)=>{
  const {amount,planid}=req.body
  const id=req.user.data.id
  User.findOne({_id:id},(err,user)=>{
    if(err){
      return res.status(400).json({
        message:'an error occured'
      })
    }
    if(user){
      Savings.findOne({user:id},(error,save)=>{
        let savData=save.savings.filter((data)=>{
          if (data._id==planid) {
            return data._id==planid
          }
        })
        console.log(savData)
        user.withdrawalRequestList.map((fd)=>{
          if(fd.planid==planid && fd.state=="pending"){
            user.history.push({
              date: new Date(),
              type: "savings - withdrawal",
              message: "you can't withdraw from one plan twice until the previous request is paid",
            })
            user.save().then(()=>{
              return res.status(200).json({
                message:`you can't withdraw from this plan twice`
              })
            })
          }
        })
        user.withdrawalRequestList.push({
          status:false,
          amount,
          planid,
          date:new Date(),
          name:savData[0].name,
          purpose:savData[0].purpose,
          state:"pending",
          email:user.email

        })
        user.withdrawalRequest=true
        user.save()
        .then(()=>{
          return res.status(200).json({
            message:'request sent successfully please await verification',
          })
        })

      })
    }
  })
}
exports.userwithdrawls=(req,res)=>{
  const id=req.user.data.id
  User.findOne({_id:id},(err,user)=>{
    if(err){
      return res.status(400).json({
        message:'an error occured'
      })
    }
    if(user){
      if(user.withdrawalRequestList){
        res.status(200).json({
          withdrawals:user.withdrawalRequestList
        })
      }else{
        res.status(200).json({
          withdrawals:[]
        })
      }
    }
  })
}


exports.terminateSavings=(req,res)=>{
  const {purpose,planid,balance}=req.body
  const id=req.user.data.id
  User.findOne({_id:id},(err,user)=>{
    if(err){
      return res.status(400).json({
        message:'an error occured'
      })
    }
    if(user){
      Savings.findOne({user:user._id})
      .then(save=>{
       let returnedVal=save.savings.filter((sav)=>{
          if(sav._id==planid){
            return sav
          }
       })
       user.terminateRequestList.push({
        status:false,
        state:'pending',
        purpose,
        planid,
        date:new Date(),
        email:user.email,
        userid:user._id,
        balance:returnedVal[0].balance,
        reoccuring:returnedVal[0].amount,
        name:returnedVal[0].name,
        purpose2:returnedVal[0].purpose
      })
      user.terminateRequest=true
      user.save()
      .then(()=>{
        return res.status(200).json({
          message:'request sent successfully',
        })
      })
      })

    }
  })
}


exports.updatePic=(req,res)=>{
  const id=req.user.data.id
  User.findOne({_id:id},(err,user)=>{
    if(err){
      return res.status(400).json({
        message:'an error occured'
      })
    }
    if(user){
      user.profile=req.file.path
      user.save()
      .then(()=>{
        return res.status(200).json({
          message:'updated successfully',
        })
      })
    }
  })
}

exports.resetpassword = (req, res) => {
  const { email, type } = req.body;
  if (type === "user") {
    User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: `The email address  +
            ${email}
             is not associated with any account. Double-check 
            your email address and try again.`,
        });
      }
      user.generatePasswordReset();

      user.save().then((user) => {
        let link =
          "http://" +
          req.headers.origin +
          req.body.path +"?token="+
          user.resetPasswordToken;

        sendmailtouser = async () => {
          const nodemailer = require("nodemailer");
          let transporter = nodemailer.createTransport(
            smtpTransport({
              host: "tummyfirstmart.com",
              port: 465,
              secure: true, // true for 465, false for other ports
              auth: {
                user: process.env.NODEMAILER_USERNAME, // generated ethereal user
                pass: process.env.NODEMAILER_PASSWORD, // generated ethereal password
              },
              connectionTimeout: 5 * 60 * 1000, // 5 min

              tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
              },
            })
          );

          let info = await transporter
            .sendMail({
              from: '"Tummyfirst" <hello@tummyfirstmart.com>', // sender address
              to: user.email,
              subject: "Password change request",
              text: `Hi ${user.first_name} \n 
          Please click on the following link ${link} to reset your password. \n\n 
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            })
            .then((response) => {
              res.send(response);
            })
            .catch((error) => {
              res.json({
                message: "error occured!",
                message1: error,
              });
            });
        };
        sendmailtouser();
      });
    });
  }
  if (type === "admin" || type === "superadmin") {
    Admin.findOne({ email }).then((user) => {
      if (!user) {
        return res.status(401).json({
          message: `The email address  +
            ${email}
             is not associated with any account. Double-check 
            your email address and try again.`,
        });
      }
      user.generatePasswordReset();
      user.save().then((user) => {
        let link =
          "http://" +
          req.body.host +
          req.body.path +"?token="+
          user.resetPasswordToken;

        sendmailtouser = async () => {
          const nodemailer = require("nodemailer");
          let transporter = nodemailer.createTransport(
            smtpTransport({
              host: "tummyfirstmart.com",
              port: 465,
              secure: true, // true for 465, false for other ports
              auth: {
                user: process.env.NODEMAILER_USERNAME, // generated ethereal user
                pass: process.env.NODEMAILER_PASSWORD, // generated ethereal password
              },
              connectionTimeout: 5 * 60 * 1000, // 5 min

              tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
              },
            })
          );

          let info = await transporter
            .sendMail({
              from: '"tummyfirst" <tummyfirstmart.com>', // sender address
              to: user.email,
              subject: "Password change request",
              text: `Hi ${user.first_name} \n 
          Please click on the following link ${link} to reset your password. \n\n 
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            })
            .then((response) => {
              res.status(200).json({
                message: "A reset email has been sent to " + user.email + ".",
                response,
              });
            })
            .catch((error) => {
              res.json({
                message: "error occured!",
                message1: error,
              });
            });
        };
        sendmailtouser();
      });
    });
  }
};

exports.reset = (req, res) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user){
        return res
          .status(401)
          .json({ message: "Password reset token is invalid or has expired." });
      }
      else{

        //Redirect user to form with the email address
        res.json(200).json({
            user
        })
      }

    })
    .catch((err) => res.status(500).json({ message: err.message }));
};


exports.resetPasswordChange = (req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            const hashPassword =null
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
            const hash = bcrypt.genSalt(10, function(err, salt) {
                if (err) 
                  return callback(err);
            
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                
                  //Set the new password
                  user.password = hash;
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;
      
                  // Save
                  user.save((err) => {
                      if (err) return res.status(500).json({message: err.message});
                      res.status(200).json({
                          message:`Successfully  reset password you can now login with new password`
                      })
                  });
                });
              });
        });
};