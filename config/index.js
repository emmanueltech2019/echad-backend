require('dotenv').config()

module.exports={
    PORT:process.env.PORT,
    DB:process.env.DB,
    SALT:process.env.SALT,
    APP_SECRET:process.env.APP_SECRET
}