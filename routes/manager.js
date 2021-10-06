const express = require("express");

const router = express.Router();
const { requireSignin,managerMiddleware } = require("../common-middlewares/index");

const {
  register,
  login,
  declinedpayments,
  approvetopup,
  pendingpayments,
  profileDetails,
  profileDetails2,
  topups,
  totalUsers,
  totalSavers,
  approvedpayments,
  declinetopup,
  withdrawals,
  pendingwithdrawals,
  declinedwithdrawals,
  approvedwithdrawals,
  approvewithdrawals,
  declinewithdrawals,
  terminateRequest,
  terminatedRequestList,
  approveTerminate,
  managers
} = require("../controllers/managers");

router.post("/register", register);
router.post("/login", login);
router.get("/profiledetails", requireSignin, profileDetails);
router.get("/profiledetails2/:id", profileDetails2);

router.get("/users",requireSignin,managerMiddleware, totalUsers);
router.get("/managers",managers)
router.get("/savers", totalSavers);

router.get("/all/topup", requireSignin, topups);
router.get("/pending/topup", requireSignin, pendingpayments);
router.get("/approved/topup", requireSignin, approvedpayments);
router.get("/declined/topup", requireSignin, declinedpayments);

router.post("/approve/topup", requireSignin, approvetopup);
router.post("/decline/topup", requireSignin, declinetopup);

router.get("/all/withdrawals", requireSignin, withdrawals);
router.get("/pending/withdrawals", requireSignin, pendingwithdrawals);
router.get("/approved/withdrawals", requireSignin, approvedwithdrawals);
router.get("/declined/withdrawals", requireSignin, declinedwithdrawals);

router.post("/approve/withdrawals", requireSignin, approvewithdrawals);
router.post("/decline/withdrawals", requireSignin, declinewithdrawals);



router.get('/pending/terminate',requireSignin,terminateRequest)
router.get('/approved/terminate',requireSignin,terminatedRequestList)
router.post('/approve/terminate',requireSignin,approveTerminate)

module.exports = router;
