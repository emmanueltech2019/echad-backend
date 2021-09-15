const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SALT, APP_SECRET } = require("../config");
const Admin = require("../models/admin.model");
const Users = require("../models/user.model");
const Savings = require("../models/savings.model");

exports.register = (req, res) => {
  const { email, password, fullname } = req.body;
  Admin.findOne({ email }, (err, admin) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured",
      });
    }
    if (admin) {
      return res.status(400).json({
        message: "email already exist",
      });
    }
    if (!admin) {
      const salt = bcrypt.genSaltSync(parseInt(SALT));
      const hash = bcrypt.hashSync(password, salt);

      let newAdmin = new Admin({
        password: hash,
        fullname,
        email,
      });

      newAdmin
        .save()
        .then((resp) => {
          let token = jwt.sign(
            {
              // exp: Math.floor  (Date.now() / 1000) + 60 * 60,
              data: { id: resp._id },
            },
            APP_SECRET
          );
          res.status(201).json({
            message: "account created successfully",
            token,
          });
        })
        .catch(() => {
          res.status(500).json({
            message: "unknown error occured during account creation",
          });
        });
    }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  Admin.findOne({ email }, (err, admin) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured ",
      });
    }
    if (!admin) {
      return res.status(404).json({
        message: "account does not exist",
      });
    }
    if (admin) {
      let isPasswordValid = bcrypt.compareSync(password, admin.password);
      if (isPasswordValid) {
        let token = jwt.sign(
          {
            // exp: Math.floor  (Date.now() / 1000) + 60 * 60,
            data: { id: admin._id },
          },
          APP_SECRET
        );
        res.status(200).json({
          token,
          message: "login successful",
          admin: {
            _id: admin._id,
            fullname: admin.fullname,
          },
        });
      } else {
        res.status(400).json({
          message: "invalid password",
        });
      }
    }
  });
};

exports.profileDetails = (req, res) => {
  const { id } = req.user.data;
  Admin.findOne({ _id: id }, (err, admin) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured",
      });
    }
    if (admin) {
      return res.status(200).json({
        message: "success",
        admin,
      });
    }
  });
};

exports.totalUsers = (req, res) => {
  Users.find({})
    .then((users) => {
      return res.status(200).json({
        users,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "an error occured",
      });
    });
};

exports.totalSavers = (req, res) => {
  Savings.find({})
    .then((savers) => {
      return res.status(200).json({
        savers,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "an error occured",
      });
    });
};

exports.topups = (req, res) => {
  Users.find({ startedSaving: true }, (err, users) => {
    if (err) {
      return res.status(400).json({
        message: "an erorr occured",
      });
    }
    if (users) {
      let list = [];
      users.map((user) => {
        user.transfers.map((item) => {
          list.push(item);
        });
      });
      return res.status(200).json({
        list,
      });
    } else {
      return res.status(200).json({
        list: [],
      });
    }
  });
};
exports.pendingpayments = (req, res) => {
  Users.find({ paymentRequest: true }, (err, users) => {
    if (err) {
      return res.status(400).json({
        message: "an erorr occured",
      });
    }
    if (users) {
      let list = [];
      users.map((user) => {
        user.transfers.map((item) => {
          if (item.state == "pending") {
            list.push(item);
          } else {
          }
        });
      });
      return res.status(200).json({
        list,
      });
    }
  });
};
exports.approvedpayments = (req, res) => {
  Users.find({ paymentRequest: true }, (err, users) => {
    if (err) {
      return res.status(400).json({
        message: "an erorr occured",
      });
    }
    if (users) {
      let list = [];
      users.map((user) => {
        user.transfers.map((item) => {
          if (item.state == "approved") {
            list.push(item);
          } else {
          }
        });
      });
      return res.status(200).json({
        list,
      });
    }
  });
};

exports.declinedpayments = (req, res) => {
  Users.find({ paymentRequest: true }, (err, users) => {
    if (err) {
      return res.status(400).json({
        message: "an erorr occured",
      });
    }
    if (users) {
      let list = [];
      users.map((user) => {
        user.transfers.map((item) => {
          if (item.state == "declined") {
            list.push(item);
          } else {
          }
        });
      });
      return res.status(200).json({
        list,
      });
    }
  });
};
exports.approvetopup = (req, res) => {
  let { planid, email } = req.body;
  Users.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured",
      });
    }
    Savings.findOne({ user: user._id }, (err, saving) => {
      if (err) {
        return res.status(400).json({
          message: "an error occured",
        });
      }
      if (saving) {
        let r = saving.savings.filter((data) => {
          return data._id == planid;
        });
        let previousBalance = r[0].balance;
        let paymentDetails = user.transfers.filter((trans) => {
          return trans.planid == r[0]._id.toString();
        });
        let newBalance = parseInt(paymentDetails[0].amount) + previousBalance;
        Savings.findOneAndUpdate(
          { id: req.params.id, "savings._id": planid },
          {
            $set: {
              "savings.$.balance": newBalance,
            },
          }
        ).then(() => {
          Users.findOneAndUpdate(
            { email, "transfers.planid": planid },
            {
              $set: {
                "transfers.$.approved": true,
                "transfers.$.state": "approved",
              },
            }
          ).then((resp) => {
            resp.history.push({
              date: new Date(),
              type: "savings - topup",
              message: "savings approved successfully",
            });
            resp.save().then(() => {
              res.status(200).json({
                message: "successfully approved",
              });
            });
          });
        });
      }
    });
  });
};

exports.declinetopup = (req, res) => {
  let { planid, email } = req.body;
  Users.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured",
      });
    }
    Savings.findOne({ user: user._id }, (err, saving) => {
      if (err) {
        return res.status(400).json({
          message: "an error occured",
        });
      }
      if (saving) {
        let r = saving.savings.filter((data) => {
          return data._id == planid;
        });
        let previousBalance = r[0].balance;
        let paymentDetails = user.transfers.filter((trans) => {
          return trans.planid == r[0]._id.toString();
        });
        Savings.findOneAndUpdate(
          { id: req.params.id, "savings._id": planid },
          {}
        ).then(() => {
          Users.findOneAndUpdate(
            { email, "transfers.planid": planid },
            {
              $set: {
                "transfers.$.approved": false,
                "transfers.$.state": "declined",
              },
            }
          ).then((resp) => {
            resp.history.push({
              date: new Date(),
              type: "savings - topup",
              message: "savings declined",
            });
            resp.save().then(() => {
              res.status(200).json({
                message: "successfully declined",
              });
            });
          });
        });
      }
    });
  });
};

exports.withdrawals = (req, res) => {
  Users.find({ withdrawalRequest: true }, (err, users) => {
    if (err) {
      return res.status(400).json({
        message: "an erorr occured",
      });
    }
    if (users) {
      let list = [];
      users.map((user) => {
        user.withdrawalRequestList.map((item) => {
          list.push(item);
        });
      });
      return res.status(200).json({
        list,
      });
    } else {
      return res.status(200).json({
        list: [],
      });
    }
  });
};

exports.pendingwithdrawals = (req, res) => {
  Users.find(
    { "withdrawalRequestList.status": { $gte: false } },
    (err, users) => {
      1;
      if (err) {
        return res.status(400).json({
          message: "an erorr occured",
        });
      }
      if (users) {
        let list = [];
        users.map((user) => {
          user.withdrawalRequestList.map((item) => {
            if (item.state == "pending") {
              list.push(item);
            } else {
            }
          });
        });
        return res.status(200).json({
          list,
        });
      }
    }
  );
};

exports.declinedwithdrawals = (req, res) => {
  Users.find(
    { withdrawalRequest: true, "withdrawalRequestList.state": "declined" },
    (err, users) => {
      if (err) {
        return res.status(400).json({
          message: "an erorr occured",
        });
      }
      if (users) {
        let list = [];
        users.map((user) => {
          user.withdrawalRequestList.map((item) => {
            if (item.state == "declined") {
              list.push(item);
            } else {
            }
          });
        });
        return res.status(200).json({
          list,
        });
      }
    }
  );
};

exports.approvedwithdrawals = (req, res) => {
  Users.find(
    { withdrawalRequest: true, "withdrawalRequestList.state": "approved" },
    (err, users) => {
      if (err) {
        return res.status(400).json({
          message: "an erorr occured",
        });
      }
      if (users) {
        let list = [];
        users.map((user) => {
          user.withdrawalRequestList.map((item) => {
            if (item.status == true) {
              list.push(item);
            } else {
            }
          });
        });
        return res.status(200).json({
          list,
        });
      }
    }
  );
};

exports.approvewithdrawals = (req, res) => {
  let { planid, email } = req.body;
  Users.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured",
      });
    }
    Savings.findOne({ user: user._id }, (err, saving) => {
      if (err) {
        return res.status(400).json({
          message: "an error occured",
        });
      }
      if (saving) {
        let r = saving.savings.filter((data) => {
          return data._id == planid;
        });
        let previousBalance = r[0].balance;
        let withdrawalDetails = user.withdrawalRequestList.filter((trans) => {
          if (trans.planid == r[0]._id.toString() && trans.state == "pending") {
            return trans;
          } else {
          }
        });
        let amountToTake = parseInt(withdrawalDetails[0].amount);

        if (amountToTake <= previousBalance) {
          let newBalance = previousBalance - amountToTake;

          console.log("git");
          Savings.findOneAndUpdate(
            { "savings._id": planid },
            {
              $set: {
                "savings.$.balance": newBalance,
              },
            }
          ).then(() => {
            console.log("heh");
            Users.findOneAndUpdate(
              {
                email,
                "withdrawalRequestList.date": withdrawalDetails[0].date,
              },
              {
                $set: {
                  "withdrawalRequestList.$.status": true,
                  "withdrawalRequestList.$.state": "approved",
                },
              }
            ).then((resp) => {
              console.log(resp);
              resp.history.push({
                date: new Date(),
                type: "savings - withdrawal",
                message: "withdrawal paid successfully",
              });
              resp.withdrawalRequestHistory.push({
                date: new Date(),
                type: "savings - withdrawal",
                amount: amountToTake,
                message: "withdrawal paid successfully",
              });
              resp.save().then(() => {
                res.status(200).json({
                  message: "successfully paid",
                });
              });
            });
          });
        } else {
          return res.status(400).json({
            message: "insufficient balance",
          });
        }
      }
    });
  });
};

exports.declinewithdrawals = (req, res) => {
  let { planid, email } = req.body;
  Users.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured",
      });
    }
    Savings.findOne({ user: user._id }, (err, saving) => {
      if (err) {
        return res.status(400).json({
          message: "an error occured",
        });
      }
      if (saving) {
        let r = saving.savings.filter((data) => {
          return data._id == planid;
        });
        let previousBalance = r[0].balance;
        let withdrawalDetails = user.withdrawalRequestList.filter((trans) => {
          if (trans.planid == r[0]._id.toString() && trans.state == "pending") {
            return trans;
          } else {
          }
        });
        let amountToTake = parseInt(withdrawalDetails[0].amount);

        Savings.findOneAndUpdate(
          { id: req.params.id, "savings._id": planid },
          {}
        ).then(() => {
          Users.findOneAndUpdate(
            { email, "withdrawalRequestList.date": withdrawalDetails[0].date },
            {
              $set: {
                "withdrawalRequestList.$.status": false,
                "withdrawalRequestList.$.state": "declined",
              },
            }
          ).then((resp) => {
            resp.history.push({
              date: new Date(),
              type: "savings - withdrawal",
              message: "withdrawal unsuccessful",
            });
            resp.withdrawalRequestHistory.push({
              date: new Date(),
              type: "savings - withdrawal",
              amount: 0,
              message: "withdrawal paid successfully",
            });
            resp.save().then(() => {
              res.status(200).json({
                message: "payment declined",
              });
            });
          });
        });
      }
    });
  });
};

exports.terminateRequest = (req, res) => {
  Users.find({ terminateRequest: true }, (err, users) => {
    if (err) {
      return res.status(400).json({
        message: "an erorr occured",
      });
    }
    if (users) {
      let list = [];
      users.map((user) => {
        user.terminateRequestList.map((item) => {
          if (item.state == "pending") {
            list.push(item);
          } else {
          }
        });
      });
      return res.status(200).json({
        list,
      });
    }
  });
};

exports.terminatedRequestList = (req, res) => {
  Users.find({ terminateRequest: true }, (err, users) => {
    if (err) {
      return res.status(400).json({
        message: "an erorr occured",
      });
    }
    if (users) {
      let list = [];
      users.map((user) => {
        user.terminateRequestList.map((item) => {
          if (item.state == "approved") {
            list.push(item);
          } else {
          }
        });
      });
      return res.status(200).json({
        list,
      });
    }
  });
};

exports.approveTerminate = (req, res) => {
  let { planid, email } = req.body;
  Users.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(400).json({
        message: "an error occured",
      });
    }
    Savings.findOne({ user: user._id }, (err, saving) => {
      if (err) {
        return res.status(400).json({
          message: "an error occured",
        });
      }
      if (saving) {
        Savings.findOneAndUpdate(
          { "savings._id": planid },
          {
            $pull: {
              savings: { _id: planid },
            },
          }
        ).then(() => {
          Users.findOneAndUpdate(
            { email, "terminateRequestList.date": withdrawalDetails[0].date },
            {
              $set: {
                "terminateRequestList.$.status": true,
                "terminateRequestList.$.state": "approved",
              },
            }
          ).then((resp) => {
            resp.history.push({
              date: new Date(),
              type: "savings - terminate",
              message: "terminated successfully",
            });

            resp.save().then(() => {
              res.status(200).json({
                message: "successfully terminated",
              });
            });
          });
        });
      }
    });
  });
};
