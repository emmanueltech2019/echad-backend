const express = require("express");

const router = express.Router();
const {
  register,
  login,
  profileDetails,
  updateAccount,
  newSaving,
  getuserssavings,
  makepaymenttransfer,
  withdrawSavings,
  terminateSavings,
  userwithdrawls,
  updatePic
} = require("../controllers/auth");
const { requireSignin, parser } = require("../common-middlewares/index");
const { mangers } = require("../controllers/admin");
router.post("/register", register);
router.post("/login", login);
router.put("/updateaccount", requireSignin, updateAccount);
router.get("/profiledetails", requireSignin, profileDetails);
router.post("/newsaving", requireSignin, newSaving);
router.get("/getuserssavings", requireSignin, getuserssavings);
router.post("/makepaymenttransfer", requireSignin, parser, makepaymenttransfer);
router.post("/withdraw/savings",requireSignin,withdrawSavings); 
router.post("/terminate/savings",requireSignin,terminateSavings);
router.get('/withdrawal/list',requireSignin,userwithdrawls);
router.post('/update/profile/picture',requireSignin,parser,updatePic);
router.get('/managers',mangers)

module.exports = router;
